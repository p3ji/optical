import test from "node:test";
import assert from "node:assert/strict";
import { calendarLinks, createIcs, validateBooking } from "../src/index.js";

const booking = { id: "64c24af4-f208-4a75-b663-76efb73fd0bb", branch_id: "kanata", patient_name: "Jamie Demo", patient_email: "jamie@example.com", patient_phone: "6135550123", service_type: "exam", appointment_date: "2026-10-15", appointment_time: "10:30" };

test("validates a complete booking", () => assert.deepEqual(validateBooking(booking), { valid: true, errors: {} }));
test("rejects invalid patient and slot data", () => { const result = validateBooking({ ...booking, patient_email: "bad", patient_phone: "12", appointment_time: "10:17" }); assert.equal(result.valid, false); assert.ok(result.errors.patient_email); assert.ok(result.errors.patient_phone); assert.ok(result.errors.appointment_time); });
test("creates a timezone-aware calendar file", () => { const ics = createIcs(booking); assert.match(ics, /DTSTART;TZID=America\/Toronto:20261015T103000/); assert.match(ics, /DTEND;TZID=America\/Toronto:20261015T111500/); assert.match(ics, /SUMMARY:Chicco Optical — Comprehensive Eye Exam/); });
test("creates Google, Outlook, and ICS calendar actions", () => { const links = calendarLinks(booking, "https://booking.example.workers.dev/"); assert.match(links.google, /^https:\/\/calendar\.google\.com/); assert.match(links.outlook, /^https:\/\/outlook\.live\.com/); assert.equal(links.ics, "https://booking.example.workers.dev/api/bookings/64c24af4-f208-4a75-b663-76efb73fd0bb/calendar.ics"); });
