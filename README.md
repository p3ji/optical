# Chicco Optical booking demo

A zero-dependency, mobile-first appointment booking widget embedded into a polished optical retail landing page. The widget runs inside Shadow DOM, supports keyboard navigation, simulates availability, and prepares booking handoffs to `pejisystems@gmail.com` or `3439982681` without silently transmitting visitor data.

## Run

Open `index.html` directly, or serve the folder locally:

```powershell
python -m http.server 4173
```

Then visit `http://localhost:4173`.

## Embed

```html
<script
  src="https://your-cdn.example/booking-widget.js"
  data-mode="demo"
  data-email="pejisystems@gmail.com"
  data-sms="3439982681">
</script>
```

Any element with `data-open-chicco-booking` opens the modal. For a live backend, add `data-api="https://your-worker.example"`; the widget will post bookings to `/appointments`.

## Demo behavior

- Availability is deterministic mock data, so the interface can be tested without credentials.
- The final action opens the visitor's email or SMS application with the full request prefilled.
- No medical details or OHIP information are collected.
- The Google Calendar action generates a client-side deep link.

The Cloudflare Worker, D1, Google Calendar, Resend, and Twilio services are the natural production phase after API credentials and exact branch data are available.
