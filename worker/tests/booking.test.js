import test from "node:test";
import assert from "node:assert/strict";
import worker, { calendarLinks, createIcs, validateBooking, confirmationEmail } from "../src/index.js";

const booking = { id: "64c24af4-f208-4a75-b663-76efb73fd0bb", branch_id: "kanata", patient_name: "Jamie Demo", patient_email: "jamie@example.com", patient_phone: "6135550123", service_type: "exam", appointment_date: "2026-10-15", appointment_time: "10:30" };

test("validates a complete booking", () => assert.deepEqual(validateBooking(booking), { valid: true, errors: {} }));
test("rejects invalid patient and slot data", () => { const result = validateBooking({ ...booking, patient_email: "bad", patient_phone: "12", appointment_time: "10:17" }); assert.equal(result.valid, false); assert.ok(result.errors.patient_email); assert.ok(result.errors.patient_phone); assert.ok(result.errors.appointment_time); });
test("creates a timezone-aware calendar file", () => { const ics = createIcs(booking); assert.match(ics, /DTSTART;TZID=America\/Toronto:20261015T103000/); assert.match(ics, /DTEND;TZID=America\/Toronto:20261015T111500/); assert.match(ics, /SUMMARY:Chicco Optical — Comprehensive Eye Exam/); });
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
test("generates branded confirmation email with service, time, and Google Calendar link", () => {
  const links = calendarLinks(booking, "https://booking.example.workers.dev");
  const html = confirmationEmail(booking, links);
  assert.match(html, /CHICCO OPTICAL/);
  assert.match(html, /Comprehensive Eye Exam/);
  assert.match(html, /10:30 AM/);
  assert.match(html, /October 15, 2026/);
  assert.match(html, /Kanata/);
  assert.match(html, /Add to Google Calendar/);
  assert.match(html, /calendar\.google\.com\/calendar\/render/);
  assert.match(html, /chicco-logo\.png/);
});
