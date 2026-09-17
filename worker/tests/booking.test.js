import test from "node:test";
import assert from "node:assert/strict";
import worker, { calendarLinks, createIcs, validateBooking, confirmationEmail } from "../src/index.js";

const booking = { id: "64c24af4-f208-4a75-b663-76efb73fd0bb", branch_id: "kanata", patient_name: "Jamie Demo", patient_email: "jamie@example.com", patient_phone: "6135550123", service_type: "exam", appointment_date: "2026-10-15", appointment_time: "10:30" };

test("validates a complete booking", () => assert.deepEqual(validateBooking(booking), { valid: true, errors: {} }));
test("rejects invalid patient and slot data", () => { const result = validateBooking({ ...booking, patient_email: "bad", patient_phone: "12", appointment_time: "10:17" }); assert.equal(result.valid, false); assert.ok(result.errors.patient_email); assert.ok(result.errors.patient_phone); assert.ok(result.errors.appointment_time); });
test("creates a timezone-aware calendar file", () => { const ics = createIcs(booking); assert.match(ics, /DTSTART;TZID=America\/Toronto:20261015T103000/); assert.match(ics, /DTEND;TZID=America\/Toronto:20261015T105500/); assert.match(ics, /SUMMARY:Chicco Optical — Eye Exam/); });
test("creates Google, Outlook, and ICS calendar actions", () => { const links = calendarLinks(booking, "https://booking.example.workers.dev/"); assert.match(links.google, /^https:\/\/calendar\.google\.com/); assert.match(links.outlook, /^https:\/\/outlook\.live\.com/); assert.equal(links.ics, "https://booking.example.workers.dev/api/bookings/64c24af4-f208-4a75-b663-76efb73fd0bb/calendar.ics"); });
test("redirects /demo_booking to /demo_booking/", async () => {
  const res = await worker.fetch(new Request("https://www.peji.ca/demo_booking"), {});
  assert.equal(res.status, 301);
  assert.equal(res.headers.get("Location"), "https://www.peji.ca/demo_booking/");
});
test("handles /demo_booking/api/health health check", async () => {
  const res = await worker.fetch(new Request("https://www.peji.ca/demo_booking/api/health"), {});
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.ok, true);
  assert.equal(data.service, "chicco-booking-api");
});
test("handles demobooking.peji.ca/api/health check", async () => {
  const res = await worker.fetch(new Request("https://demobooking.peji.ca/api/health"), {});
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.ok, true);
});
test("redirects demobooking.peji.ca/demo_booking to root", async () => {
  const res = await worker.fetch(new Request("https://demobooking.peji.ca/demo_booking"), {});
  assert.equal(res.status, 301);
  assert.equal(res.headers.get("Location"), "https://demobooking.peji.ca/");
});
test("generates branded confirmation email with service, time, and Google Calendar link", () => {
  const links = calendarLinks(booking, "https://booking.example.workers.dev");
  const html = confirmationEmail(booking, links);
  assert.match(html, /CHICCO OPTICAL/);
  assert.match(html, /Eye Exam/);
  assert.match(html, /10:30 AM/);
  assert.match(html, /October 15, 2026/);
  assert.match(html, /Kanata/);
  assert.match(html, /Add to Google Calendar/);
  assert.match(html, /calendar\.google\.com\/calendar\/render/);
  assert.match(html, /chicco-logo\.png/);
});

test("generates branded reminder email with 'See you tomorrow' and appointment details", async () => {
  const { reminderEmail } = await import("../src/index.js");
  const links = calendarLinks(booking, "https://booking.example.workers.dev");
  const html = reminderEmail(booking, links);
  assert.match(html, /CHICCO OPTICAL/);
  assert.match(html, /Reminder/);
  assert.match(html, /See you tomorrow, Jamie\./);
  assert.match(html, /Eye Exam/);
  assert.match(html, /10:30 AM/);
  assert.match(html, /October 15, 2026/);
  assert.match(html, /Kanata/);
  assert.match(html, /Terry Fox Drive/);
  assert.match(html, /Google Calendar/);
  assert.match(html, /Please arrive 10 minutes early/);
});

test("calculates tomorrow's date and hour in Ottawa timezone", async () => {
  const { getTomorrowOttawaDate, getOttawaHour } = await import("../src/index.js");
  const testDate = new Date("2026-10-15T12:00:00Z");
  const tomorrow = getTomorrowOttawaDate(testDate);
  assert.equal(tomorrow, "2026-10-16");

  const hour = getOttawaHour(testDate);
  assert.equal(typeof hour, "number");
  assert.ok(hour >= 0 && hour <= 23);
});

test("processReminders queries due bookings, sends reminder emails, and updates DB", async () => {
  const { processReminders } = await import("../src/index.js");
  const sentEmails = [];
  const dbUpdates = [];

  const mockDb = {
    prepare(query) {
      return {
        bind(...args) {
          return {
            async all() {
              if (query.includes("SELECT * FROM bookings")) {
                return {
                  results: [
                    {
                      id: "b-101",
                      branch_id: "kanata",
                      patient_name: "Sarah Test",
                      patient_email: "sarah@example.com",
                      patient_phone: "6135559876",
                      service_type: "exam",
                      appointment_date: "2026-10-16",
                      appointment_time: "09:00",
                      status: "CONFIRMED",
                      reminder_sent_at: null,
                    },
                  ],
                };
              }
              return { results: [] };
            },
            async run() {
              if (query.includes("UPDATE bookings SET reminder_sent_at")) {
                dbUpdates.push({ query, args });
              }
              return { success: true };
            },
          };
        },
      };
    },
  };

  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (url, options) => {
    if (String(url).includes("api.resend.com")) {
      const body = JSON.parse(options.body);
      sentEmails.push(body);
      return new Response(JSON.stringify({ id: "resend-remind-123" }), { status: 200 });
    }
    return originalFetch(url, options);
  };

  try {
    const env = {
      DB: mockDb,
      RESEND_API_KEY: "test_key",
      COORDINATOR_EMAIL: "pejisystems@gmail.com",
      BOOKING_FROM_EMAIL: "Chicco Optical <bookings@peji.ca>",
      PUBLIC_API_URL: "https://chicco-booking-api.push-peji.workers.dev",
    };

    const summary = await processReminders(env, "2026-10-16");
    assert.equal(summary.total_due, 1);
    assert.equal(summary.sent, 1);
    assert.equal(summary.failed, 0);
    assert.equal(sentEmails.length, 1);
    assert.equal(sentEmails[0].to[0], "sarah@example.com");
    assert.match(sentEmails[0].subject, /Reminder: Tomorrow's Eye Exam/);
    assert.equal(dbUpdates.length, 1);
    assert.equal(dbUpdates[0].args[0], "resend-remind-123");
    assert.equal(dbUpdates[0].args[1], "b-101");
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("handles /api/reminders/send endpoint and returns execution summary", async () => {
  const mockDb = {
    prepare(query) {
      return {
        bind() {
          return {
            async all() { return { results: [] }; },
            async run() { return { success: true }; },
          };
        },
      };
    },
  };

  const res = await worker.fetch(new Request("https://demobooking.peji.ca/api/reminders/send?date=2026-10-16"), {
    DB: mockDb,
    PUBLIC_API_URL: "https://chicco-booking-api.push-peji.workers.dev",
  });
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.ok, true);
  assert.equal(data.summary.date, "2026-10-16");
  assert.equal(data.summary.total_due, 0);
});

test("handles worker.scheduled cron trigger", async () => {
  let scheduledProcessed = false;
  const mockDb = {
    prepare(query) {
      return {
        bind() {
          return {
            async all() {
              scheduledProcessed = true;
              return { results: [] };
            },
            async run() { return { success: true }; },
          };
        },
      };
    },
  };

  await worker.scheduled({ cron: "0 12 * * *" }, {
    DB: mockDb,
    PUBLIC_API_URL: "https://chicco-booking-api.push-peji.workers.dev",
  }, {});

  assert.equal(scheduledProcessed, true);
});

test("supports all 6 appointment types with valid validation and correct durations", () => {
  const types = [
    { type: "exam", name: "Eye Exam", duration: 25 },
    { type: "purchase_glasses", name: "Purchase Glasses", duration: 60 },
    { type: "purchase_contacts", name: "Purchase Contact Lens", duration: 30 },
    { type: "contacts", name: "Contact Lens Fitting", duration: 60 },
    { type: "repair", name: "Frame Repair", duration: 20 },
    { type: "adjustment", name: "Frame Adjustment", duration: 20 },
  ];

  for (const t of types) {
    const valid = validateBooking({ ...booking, service_type: t.type });
    assert.equal(valid.valid, true, `Validation failed for ${t.type}`);
    const ics = createIcs({ ...booking, service_type: t.type });
    assert.match(ics, new RegExp(`SUMMARY:Chicco Optical — ${t.name}`));
    const links = calendarLinks({ ...booking, service_type: t.type }, "https://chicco-booking-api.push-peji.workers.dev");
    assert.ok(links.google.includes(encodeURIComponent(`Chicco Optical — ${t.name}`)));
  }
});

