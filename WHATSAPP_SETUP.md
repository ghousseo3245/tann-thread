# WhatsApp order notifications (Meta Cloud API)

Whenever an order is placed through `/api/orders`, the server sends a
plain-text order notification to the owner's WhatsApp number using the
Meta WhatsApp Cloud API. This is best effort: if WhatsApp is not
configured, orders are still saved to Supabase normally and the
notification is skipped.

## How the owner number is resolved (precedence)

1. Supabase `settings` table, row keyed `whatsapp_owner_number` (settable
   from the admin area). Highest precedence.
2. `WHATSAPP_OWNER_NUMBER` environment variable.
3. Built-in default `923017378936` (used only when both of the above are
   unset or empty). This means no configuration is required for the
   notification to reach the owner once the Meta credentials are in place.

## Setup steps

1. Create a Meta app at https://developers.facebook.com/apps, then add the
   **WhatsApp** product to the app.
2. In WhatsApp > API Setup, note your **phone number ID** (and the test
   phone number while developing).
3. Create a system user in your Meta Business Settings, grant the
   `whatsapp_business_messaging` permission, and generate a **permanent
   access token**.
4. Add the environment variables to Netlify (Site settings > Environment
   Variables) or to `.env.local` for local development:
   - `WHATSAPP_PHONE_NUMBER_ID`
   - `WHATSAPP_ACCESS_TOKEN`
   - `WHATSAPP_OWNER_NUMBER` (optional, defaults to 923017378936)
5. Redeploy so the new environment variables take effect.

## Sending to the production owner number

The built-in default (923017378936) covers the owner number out of the
box. If the number ever changes, update the `whatsapp_owner_number` row in
the Supabase `settings` table (takes effect immediately, no redeploy) or
set `WHATSAPP_OWNER_NUMBER` and redeploy. Both override the default.

Note: during Meta's test phase you can only message numbers you have
added as test recipients in the WhatsApp > API Setup page. Moving to a
production number requires completing WhatsApp business verification and
phone number verification in the Meta app dashboard.
