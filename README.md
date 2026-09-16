# Chicco Optical booking demo

A zero-dependency, mobile-first appointment booking widget embedded into a polished optical retail landing page. The widget runs inside Shadow DOM, supports keyboard navigation, simulates availability, and prepares booking handoffs to `pejisystems@gmail.com` or `3439982681` without silently transmitting visitor data.

## Run

Open `index.html` directly, or serve the folder locally:

```powershell
python -m http.server 4173
```

Then visit `http://localhost:4173`.

## Test

Install the development dependency and browser once, then run the desktop and mobile integration suite:

```powershell
npm install
npx playwright install chromium
npm test
```

The tests load `tests/fixtures/mock-host.html` directly as a static `file:///` host and complete the booking flow without opening or sending the generated email, SMS, or calendar links.

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

## Deployment

Pushes to `main` publish a GitHub Pages artifact with the demo under `/demo_booking/`. The repository Pages URL is the immediately available host; `https://www.peji.com/demo_booking/` additionally requires the `www.peji.com` DNS record and Pages custom-domain setting to point to GitHub Pages.

Live demo: [https://p3ji.github.io/optical/demo_booking/](https://p3ji.github.io/optical/demo_booking/)
