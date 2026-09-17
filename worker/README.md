# Live booking API setup

The Worker stores bookings in Cloudflare D1, prevents duplicate branch/time bookings, sends the patient confirmation through Resend, BCCs `pejisystems@gmail.com`, and serves Google, Outlook, and downloadable `.ics` calendar actions.

Deployed API: `https://chicco-booking-api.push-peji.workers.dev`

## Required accounts

1. A Cloudflare account authenticated with Wrangler.
2. A Resend account with `peji.com` verified as a sending domain.

## Provision and deploy

```powershell
npx wrangler login
npx wrangler d1 create chicco-bookings
```

Replace the zero UUID in `worker/wrangler.toml` with the returned database ID, then configure the Worker URL and verified sender in the same file. Apply the migration and add the email secret:

```powershell
npx wrangler d1 migrations apply chicco-bookings --remote --config worker/wrangler.toml
npx wrangler secret put RESEND_API_KEY --config worker/wrangler.toml
npm run worker:deploy
```

After Resend is configured and a test email succeeds, add the deployed Worker URL to the widget script in `index.html`:

```html
<script src="./booking-widget.js" data-api="https://chicco-booking-api.push-peji.workers.dev"></script>
```

Do not commit the Resend API key. Until `data-api` is configured, the public page remains in safe handoff-demo mode.
