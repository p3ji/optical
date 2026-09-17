# Chicco Optical booking demo

A zero-dependency booking widget demo for Chicco Optical's five Ottawa locations.

## Stack
Vanilla HTML, CSS, and JavaScript. No build step. The widget is self-contained in `booking-widget.js` and uses Shadow DOM.

## Run
Open `index.html`, or run `python -m http.server 4173` and visit `http://localhost:4173`.

## Deployment
- Repository: `https://github.com/p3ji/optical`
- Live demo (GitHub Pages): `https://p3ji.github.io/optical/demo_booking/`
- Custom URL: `https://www.peji.ca/demo_booking/` (routed via Cloudflare Worker reverse-proxy to GitHub Pages).
- Deploy: push `main`; `.github/workflows/deploy.yml` publishes automatically.
- Booking API: `https://chicco-booking-api.push-peji.workers.dev` (Cloudflare Worker + D1).
- Live email confirmation is powered by Resend (`RESEND_API_KEY` secret configured on Cloudflare Worker). Test confirmations send to `pejisystems@gmail.com`. For general patient emails from `bookings@peji.ca`, add `peji.ca` in Resend and verify DNS records in Cloudflare.

## Rules
- Mobile-first; must work well at 375px wide.
- Keep the embeddable widget dependency-free and style-isolated.
- Never collect medical details or OHIP data.
- Live bookings confirm by email via Resend and record in D1 database; coordinator fallback is `pejisystems@gmail.com` / `3439982681`.
