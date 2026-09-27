#!/usr/bin/env bash
# Ανέβασμα του φακέλου dist/ στο Cloudflare Pages.
set -e
# Καθαρίζουμε κενά/επιπλέον γραμμές που μπορεί να μπήκαν με την επικόλληση
export CLOUDFLARE_API_TOKEN="$(printf '%s' "${CLOUDFLARE_API_TOKEN:-}" | grep -oE '[A-Za-z0-9_-]{40,}' | head -1 || true)"
export CLOUDFLARE_ACCOUNT_ID="$(printf '%s' "${CLOUDFLARE_ACCOUNT_ID:-}" | tr -d '[:space:]')"
PROJECT="${CF_PROJECT:-yavanet}"
if [ -n "$CLOUDFLARE_API_TOKEN" ] && [ -z "$CLOUDFLARE_ACCOUNT_ID" ]; then
  # Αν δεν δόθηκε Account ID, το βρίσκουμε από το token
  export CLOUDFLARE_ACCOUNT_ID="$(curl -s https://api.cloudflare.com/client/v4/accounts -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" | grep -oE '"id":"[0-9a-f]{32}"' | head -1 | cut -d'"' -f4)"
fi
if [ -z "$CLOUDFLARE_API_TOKEN" ] || [ -z "$CLOUDFLARE_ACCOUNT_ID" ]; then echo "Cloudflare δεν έχει ρυθμιστεί ακόμα – παράλειψη."; exit 0; fi
# Δημιουργία project την πρώτη φορά (αν υπάρχει ήδη, το Cloudflare απλώς απαντά ότι υπάρχει)
curl -s -X POST "https://api.cloudflare.com/client/v4/accounts/$CLOUDFLARE_ACCOUNT_ID/pages/projects" \
  -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" -H "Content-Type: application/json" \
  --data "{\"name\":\"$PROJECT\",\"production_branch\":\"main\"}" | head -c 400; echo
# Κλειδιά για τις φόρμες του site (επαφές πελατών → Telegram / Brevo), μόνο όταν ζητηθεί
if [ "${SYNC_SECRETS:-0}" = "1" ]; then
  for NAME in TELEGRAM_BOT_TOKEN TELEGRAM_OWNER_CHAT_ID GH_DISPATCH_TOKEN BREVO_API_KEY NOTIFY_EMAIL SENDER_EMAIL BREVO_LEADS_LIST BREVO_NL_LIST_HE BREVO_NL_LIST_EN BREVO_DOI_TEMPLATE_HE BREVO_DOI_TEMPLATE_EN; do
    VAL="$(printf '%s' "${!NAME:-}" | tr -d '[:space:]')"
    if [ -n "$VAL" ]; then printf '%s' "$VAL" | npx --yes wrangler@3 pages secret put "$NAME" --project-name="$PROJECT" >/dev/null 2>&1 && echo "✓ $NAME" || echo "✗ $NAME"; fi
  done
fi
npx --yes wrangler@3 pages deploy dist --project-name="$PROJECT" --branch=main --commit-dirty=true

# Άμεσο Telegram bot (webhook) όταν υπάρχει κλειδί GitHub· αλλιώς το bot διαβάζεται κάθε 15 λεπτά
if [ "${SYNC_SECRETS:-0}" = "1" ] && [ -n "${TELEGRAM_BOT_TOKEN:-}" ]; then
  BOT="$(printf '%s' "$TELEGRAM_BOT_TOKEN" | tr -d '[:space:]')"
  if [ -n "$(printf '%s' "${GH_DISPATCH_TOKEN:-}" | tr -d '[:space:]')" ]; then
    SECRET="$(printf 'yavanet:%s' "$BOT" | sha256sum | cut -c1-48)"
    URL="${SITE_URL:-https://yavanet.gr}"; URL="${URL%/}/api/telegram"
    curl -s "https://api.telegram.org/bot$BOT/setWebhook" -d "url=$URL" -d "secret_token=$SECRET" -d 'allowed_updates=["message","callback_query"]' | grep -o '"ok":[a-z]*' | sed 's/^/webhook /'
  else
    curl -s "https://api.telegram.org/bot$BOT/deleteWebhook" | grep -o '"ok":[a-z]*' | sed 's/^/no webhook /'
  fi
fi
