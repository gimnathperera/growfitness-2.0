# WhatsApp notifications

WhatsApp messages are sent via Twilio when `WHATSAPP_ENABLED=true` and Twilio env vars are set. Otherwise the provider logs to console (mock mode).

## Configuration

See `apps/api/.env.example`. Required for real sending:

- `WHATSAPP_ENABLED=true`
- `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_WHATSAPP_FROM` (e.g. `whatsapp:+14155238886`)
- Optional: `WHATSAPP_DEFAULT_COUNTRY_CODE` (default `94`) for normalizing numbers that start with `0`

Do not commit real tokens; use env or secrets in production.

## Events that send WhatsApp

- Free session confirmed
- Session created / updated / cancelled
- Invoice status updated
- Registration approved
- Coach payout paid
- New invoice to parent
- Month-end payment reminder (cron 25th 11:00)

## Manual testing

1. **Twilio Sandbox**: In [Twilio Console → WhatsApp Sandbox](https://www.twilio.com/console/sms/whatsapp/sandbox), join the sandbox (send the join code to the sandbox number from your WhatsApp). Use your own number as recipient for tests.

2. **Env**: Set `WHATSAPP_ENABLED=true`, `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_WHATSAPP_FROM` to the sandbox number (e.g. `whatsapp:+14155238886`).

3. **Trigger a flow** that sends WhatsApp, e.g.:
   - **Registration approved**: In admin, approve a parent registration whose user has a valid `phone` (E.164 or 0-prefixed with correct `WHATSAPP_DEFAULT_COUNTRY_CODE`).
   - **Payment reminder**: Wait for the month-end cron (25th 11:00) or temporarily run the reminder job for a parent with pending invoice and a valid phone.

4. **Verify**: Check Twilio Console → Monitor → Logs for the message, and the recipient WhatsApp for the message.

5. **Mock mode**: Set `WHATSAPP_ENABLED=false` or omit Twilio credentials; trigger the same flow and confirm API logs show `[WHATSAPP PROVIDER - MOCK MODE]` and no Twilio call.
