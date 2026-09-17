const BRANCHES = {
  kanata: { name: "Kanata", area: "Terry Fox Drive" },
  barrhaven: { name: "Barrhaven", area: "Strandherd Drive" },
  merivale: { name: "Merivale", area: "Merivale Road" },
  riverside: { name: "Riverside South", area: "Earl Armstrong Road" },
  downtown: { name: "Downtown", area: "Bank Street" },
};

const SERVICES = {
  exam: { name: "Comprehensive Eye Exam", duration: 45 },
  contacts: { name: "Contact Lens Fitting", duration: 45 },
  adjustment: { name: "Frame Adjustment", duration: 20 },
};

const ALL_SLOTS = ["09:00", "09:30", "10:30", "11:00", "13:00", "13:30", "14:30", "15:00", "16:00", "16:30"];
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const TIME_PATTERN = /^(?:0\d|1\d|2[0-3]):[0-5]\d$/;

function json(data, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(data), { status, headers: { "Content-Type": "application/json; charset=utf-8", ...extraHeaders } });
}

function corsHeaders(request, env) {
  const origin = request.headers.get("Origin");
  const allowed = String(env.ALLOWED_ORIGINS || "").split(",").map(value => value.trim()).filter(Boolean);
  const headers = { "Access-Control-Allow-Headers": "Content-Type, Idempotency-Key", "Access-Control-Allow-Methods": "GET, POST, OPTIONS", "Access-Control-Max-Age": "86400", Vary: "Origin" };
  if (origin && allowed.includes(origin)) headers["Access-Control-Allow-Origin"] = origin;
  return headers;
}

function withCors(response, request, env) {
  const headers = new Headers(response.headers);
  Object.entries(corsHeaders(request, env)).forEach(([key, value]) => headers.set(key, value));
  return new Response(response.body, { status: response.status, headers });
}

export function validateBooking(input) {
  const errors = {};
  if (!BRANCHES[input.branch_id]) errors.branch_id = "Choose a valid location.";
  if (!SERVICES[input.service_type]) errors.service_type = "Choose a valid service.";
  if (String(input.patient_name || "").trim().length < 2) errors.patient_name = "Enter the patient's full name.";
  if (!EMAIL_PATTERN.test(String(input.patient_email || ""))) errors.patient_email = "Enter a valid email address.";
  const phone = String(input.patient_phone || "").replace(/\D/g, "");
  if (phone.length < 10 || phone.length > 15) errors.patient_phone = "Enter a valid mobile number.";
  if (!DATE_PATTERN.test(String(input.appointment_date || ""))) errors.appointment_date = "Choose a valid appointment date.";
  if (!TIME_PATTERN.test(String(input.appointment_time || "")) || !ALL_SLOTS.includes(input.appointment_time)) errors.appointment_time = "Choose an available appointment time.";
  return { valid: Object.keys(errors).length === 0, errors };
}

function pad(value) { return String(value).padStart(2, "0"); }
function addMinutes(date, time, minutes) { const [hour, minute] = time.split(":").map(Number); const total = hour * 60 + minute + minutes; return { date, time: `${pad(Math.floor(total / 60) % 24)}:${pad(total % 60)}` }; }
function compactLocal(date, time) { return `${date.replaceAll("-", "")}T${time.replace(":", "")}00`; }
function escapeIcs(value) { return String(value).replaceAll("\\", "\\\\").replaceAll(";", "\\;").replaceAll(",", "\\,").replaceAll("\n", "\\n"); }

export function createIcs(booking) {
  const branch = BRANCHES[booking.branch_id];
  const service = SERVICES[booking.service_type];
  const end = addMinutes(booking.appointment_date, booking.appointment_time, service.duration);
  return ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Chicco Optical//Booking//EN", "CALSCALE:GREGORIAN", "METHOD:PUBLISH", "BEGIN:VEVENT", `UID:${booking.id}@chicco-optical`, `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "")}`, `DTSTART;TZID=America/Toronto:${compactLocal(booking.appointment_date, booking.appointment_time)}`, `DTEND;TZID=America/Toronto:${compactLocal(end.date, end.time)}`, `SUMMARY:${escapeIcs(`Chicco Optical — ${service.name}`)}`, `LOCATION:${escapeIcs(`${branch.name}, ${branch.area}, Ottawa`)}`, `DESCRIPTION:${escapeIcs("Your Chicco Optical appointment. Please arrive 10 minutes early.")}`, "END:VEVENT", "END:VCALENDAR"].join("\r\n");
}

export function calendarLinks(booking, publicApiUrl) {
  const branch = BRANCHES[booking.branch_id];
  const service = SERVICES[booking.service_type];
  const end = addMinutes(booking.appointment_date, booking.appointment_time, service.duration);
  const title = `Chicco Optical — ${service.name}`;
  const location = `${branch.name}, ${branch.area}, Ottawa`;
  const dates = `${compactLocal(booking.appointment_date, booking.appointment_time)}/${compactLocal(end.date, end.time)}`;
  const apiBase = String(publicApiUrl || "").replace(/\/$/, "");
  return {
    google: `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${dates}&ctz=America%2FToronto&location=${encodeURIComponent(location)}&details=${encodeURIComponent("Your Chicco Optical appointment. Please arrive 10 minutes early.")}`,
    outlook: `https://outlook.live.com/calendar/0/deeplink/compose?subject=${encodeURIComponent(title)}&startdt=${encodeURIComponent(`${booking.appointment_date}T${booking.appointment_time}:00`)}&enddt=${encodeURIComponent(`${end.date}T${end.time}:00`)}&location=${encodeURIComponent(location)}`,
    ics: `${apiBase}/api/bookings/${booking.id}/calendar.ics`,
  };
}

function escapeHtml(value) { return String(value).replace(/[&<>"']/g, character => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character]); }
function formatTime(time) { const [hour, minute] = time.split(":").map(Number); return `${hour % 12 || 12}:${pad(minute)} ${hour >= 12 ? "PM" : "AM"}`; }

function confirmationEmail(booking, links) {
  const branch = BRANCHES[booking.branch_id];
  const service = SERVICES[booking.service_type];
  const formattedDate = new Intl.DateTimeFormat("en-CA", { weekday: "long", month: "long", day: "numeric", year: "numeric", timeZone: "UTC" }).format(new Date(`${booking.appointment_date}T12:00:00Z`));
  return `<!doctype html><html><body style="margin:0;background:#f6f1e8;font-family:Arial,sans-serif;color:#102e2b"><table width="100%" cellpadding="0" cellspacing="0" role="presentation"><tr><td align="center" style="padding:32px 16px"><table width="100%" style="max-width:600px;background:#fff;border-radius:20px;overflow:hidden" cellpadding="0" cellspacing="0" role="presentation"><tr><td style="background:#102e2b;color:#fff;padding:26px 32px;font-size:20px;font-weight:700">CHICCO OPTICAL</td></tr><tr><td style="padding:32px"><p style="color:#df6146;font-size:12px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase">Appointment confirmed</p><h1 style="margin:8px 0 14px;font-size:30px">We'll see you soon, ${escapeHtml(booking.patient_name.split(" ")[0])}.</h1><p style="color:#5f7470;line-height:1.6">Your appointment is booked. Keep this email for your records.</p><div style="margin:24px 0;padding:20px;background:#f7f8f5;border-radius:14px"><strong>${escapeHtml(service.name)}</strong><br><span style="color:#5f7470;line-height:1.8">${escapeHtml(branch.name)} · ${escapeHtml(branch.area)}<br>${escapeHtml(formattedDate)} at ${escapeHtml(formatTime(booking.appointment_time))}</span></div><p><a href="${links.google}" style="display:inline-block;background:#102e2b;color:#fff;text-decoration:none;padding:13px 18px;border-radius:999px;font-weight:700">Add to Google Calendar</a> <a href="${links.ics}" style="display:inline-block;color:#102e2b;text-decoration:none;padding:13px 10px;font-weight:700">Download calendar file</a></p><p style="margin-top:28px;color:#70807c;font-size:12px;line-height:1.5">Need to make a change? Reply to this email or contact Chicco Optical.</p></td></tr></table></td></tr></table></body></html>`;
}

async function sendConfirmation(env, booking, links) {
  const fromAddress = env.BOOKING_FROM_EMAIL || "Chicco Optical <bookings@peji.ca>";
  const coordinator = env.COORDINATOR_EMAIL || "pejisystems@gmail.com";
  const payload = {
    from: fromAddress,
    to: [booking.patient_email],
    bcc: [coordinator],
    reply_to: coordinator,
    subject: `Confirmed: ${SERVICES[booking.service_type].name} at Chicco Optical`,
    html: confirmationEmail(booking, links),
  };

  let response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  let result = await response.json();

  // If custom domain is not yet verified in Resend, fall back to onboarding@resend.dev for test bookings to the coordinator
  if (!response.ok && String(result.message || "").toLowerCase().includes("not verified") && booking.patient_email === coordinator) {
    console.warn("Custom domain not verified on Resend; falling back to onboarding@resend.dev for coordinator test booking");
    payload.from = "Chicco Optical <onboarding@resend.dev>";
    response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    result = await response.json();
  }

  if (!response.ok) {
    console.error("Resend API rejection:", JSON.stringify(result));
    throw new Error(result.message || "Confirmation email could not be sent.");
  }
  return result.id;
}

async function availableSlots(env, url) {
  const branchId = url.searchParams.get("branch_id");
  const date = url.searchParams.get("date");
  if (!BRANCHES[branchId] || !DATE_PATTERN.test(String(date || ""))) return json({ error: "Invalid branch or date." }, 400);
  await env.DB.prepare("UPDATE bookings SET status = 'EXPIRED' WHERE status = 'PENDING' AND created_at < datetime('now', '-10 minutes')").run();
  const result = await env.DB.prepare("SELECT appointment_time FROM bookings WHERE branch_id = ? AND appointment_date = ? AND status IN ('PENDING', 'CONFIRMED')").bind(branchId, date).all();
  const occupied = new Set((result.results || []).map(row => row.appointment_time));
  return json({ slots: ALL_SLOTS.filter(time => !occupied.has(time)) });
}

async function createBooking(request, env) {
  const input = await request.json().catch(() => null);
  if (!input || input.website) return json({ error: "Invalid booking request." }, 400);
  const validation = validateBooking(input);
  if (!validation.valid) return json({ error: "Please correct the highlighted details.", fields: validation.errors }, 400);
  const idempotencyKey = request.headers.get("Idempotency-Key") || input.idempotency_key;
  if (!idempotencyKey || String(idempotencyKey).length < 16) return json({ error: "A valid idempotency key is required." }, 400);
  await env.DB.prepare("UPDATE bookings SET status = 'EXPIRED' WHERE status = 'PENDING' AND created_at < datetime('now', '-10 minutes')").run();
  const previous = await env.DB.prepare("SELECT * FROM bookings WHERE idempotency_key = ?").bind(idempotencyKey).first();
  if (previous?.status === "CONFIRMED") return json({ success: true, appointment_id: previous.id, details: previous, calendar: calendarLinks(previous, env.PUBLIC_API_URL), duplicate: true });
  const booking = previous || { id: crypto.randomUUID(), idempotency_key: idempotencyKey, branch_id: input.branch_id, patient_name: String(input.patient_name).trim(), patient_email: String(input.patient_email).trim().toLowerCase(), patient_phone: String(input.patient_phone).trim(), service_type: input.service_type, appointment_date: input.appointment_date, appointment_time: input.appointment_time, duration_minutes: SERVICES[input.service_type].duration };
  if (previous) {
    await env.DB.prepare("UPDATE bookings SET status = 'PENDING' WHERE id = ?").bind(booking.id).run();
  } else {
    try {
      await env.DB.prepare("INSERT INTO bookings (id, idempotency_key, branch_id, patient_name, patient_email, patient_phone, service_type, appointment_date, appointment_time, duration_minutes, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'PENDING')").bind(booking.id, booking.idempotency_key, booking.branch_id, booking.patient_name, booking.patient_email, booking.patient_phone, booking.service_type, booking.appointment_date, booking.appointment_time, booking.duration_minutes).run();
    } catch (error) {
      if (String(error).includes("UNIQUE")) return json({ error: "That time was just booked. Please choose another slot.", code: "SLOT_TAKEN" }, 409);
      throw error;
    }
  }
  const links = calendarLinks(booking, env.PUBLIC_API_URL);
  try {
    const emailId = await sendConfirmation(env, booking, links);
    await env.DB.prepare("UPDATE bookings SET status = 'CONFIRMED', resend_email_id = ? WHERE id = ?").bind(emailId, booking.id).run();
    return json({ success: true, appointment_id: booking.id, details: booking, calendar: links });
  } catch (err) {
    console.error("Booking confirmation failed:", err);
    await env.DB.prepare("UPDATE bookings SET status = 'EMAIL_FAILED' WHERE id = ?").bind(booking.id).run();
    return json({ error: "The appointment could not be confirmed by email. Please try again.", code: "EMAIL_FAILED" }, 502);
  }
}

async function calendarFile(env, id) {
  const booking = await env.DB.prepare("SELECT * FROM bookings WHERE id = ? AND status = 'CONFIRMED'").bind(id).first();
  if (!booking) return new Response("Not found", { status: 404 });
  return new Response(createIcs(booking), { headers: { "Content-Type": "text/calendar; charset=utf-8", "Content-Disposition": `attachment; filename="chicco-optical-${booking.appointment_date}.ics"`, "Cache-Control": "private, max-age=300" } });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: corsHeaders(request, env) });
    let response;
    try {
      if (request.method === "GET" && (url.pathname === "/api/health" || url.pathname === "/demo_booking/api/health")) {
        response = json({ ok: true, service: "chicco-booking-api" });
      } else if (request.method === "GET" && (url.pathname === "/api/slots" || url.pathname === "/demo_booking/api/slots")) {
        response = await availableSlots(env, url);
      } else if (request.method === "POST" && (url.pathname === "/api/bookings" || url.pathname === "/demo_booking/api/bookings")) {
        response = await createBooking(request, env);
      } else {
        const calMatch = url.pathname.match(/^\/(?:demo_booking\/)?api\/bookings\/([a-f0-9-]+)\/calendar\.ics$/i);
        if (request.method === "GET" && calMatch) {
          response = await calendarFile(env, calMatch[1]);
        } else if (url.pathname === "/demo_booking") {
          return Response.redirect(`${url.origin}/demo_booking/`, 301);
        } else if (url.pathname.startsWith("/demo_booking/")) {
          const subpath = url.pathname.slice("/demo_booking".length);
          const targetUrl = new URL(`https://p3ji.github.io/optical/demo_booking${subpath === "/" ? "/index.html" : subpath}`);
          const fetched = await fetch(targetUrl.toString());
          const headers = new Headers(fetched.headers);
          headers.set("Access-Control-Allow-Origin", "*");
          return new Response(fetched.body, { status: fetched.status, headers });
        } else {
          response = json({ error: "Not found." }, 404);
        }
      }
    } catch (error) {
      console.error(error);
      response = json({ error: "The booking service is temporarily unavailable." }, 500);
    }
    return withCors(response, request, env);
  },
};
