# Chicco Optical booking demo

A zero-dependency booking widget demo for Chicco Optical's five Ottawa locations.

## Stack
Vanilla HTML, CSS, and JavaScript. No build step. The widget is self-contained in `booking-widget.js` and uses Shadow DOM.

## Run
Open `index.html`, or run `python -m http.server 4173` and visit `http://localhost:4173`.

## Deployment
- Repository: `https://github.com/p3ji/optical`
- Live demo: `https://p3ji.github.io/optical/demo_booking/`
- Deploy: push `main`; `.github/workflows/deploy.yml` publishes automatically.
- Intended custom URL: `https://www.peji.com/demo_booking/` after `www.peji.com` DNS and the Pages custom domain are configured.
- Booking API: `https://chicco-booking-api.push-peji.workers.dev` (Cloudflare Worker + D1).
- Do not add `data-api` to the public widget until the `RESEND_API_KEY` Worker secret and verified `bookings@peji.com` sender are configured.

## Rules
- Mobile-first; must work well at 375px wide.
- Keep the embeddable widget dependency-free and style-isolated.
- Never collect medical details or OHIP data.
- Demo bookings route to `pejisystems@gmail.com` or `3439982681` through user-reviewed mail/SMS links.
