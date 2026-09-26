#!/usr/bin/env bash
# Ανέβασμα του φακέλου dist/ στο Cloudflare Pages.
set -e
# Καθαρίζουμε κενά/επιπλέον γραμμές που μπορεί να μπήκαν με την επικόλληση
export CLOUDFLARE_API_TOKEN="$(printf '%s' "${CLOUDFLARE_API_TOKEN:-}" | grep -oE '[A-Za-z0-9_-]{40,}' | head -1 || true)"
export CLOUDFLARE_ACCOUNT_ID="$(printf '%s' "${CLOUDFLARE_ACCOUNT_ID:-}" | tr -d '[:space:]')"
PROJECT="${CF_PROJECT:-yavanet}"
if [ -z "$CLOUDFLARE_API_TOKEN" ] || [ -z "$CLOUDFLARE_ACCOUNT_ID" ]; then echo "Cloudflare δεν έχει ρυθμιστεί ακόμα – παράλειψη."; exit 0; fi
# Δημιουργία project την πρώτη φορά (αν υπάρχει ήδη, το Cloudflare απλώς απαντά ότι υπάρχει)
curl -s -X POST "https://api.cloudflare.com/client/v4/accounts/$CLOUDFLARE_ACCOUNT_ID/pages/projects" \
  -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" -H "Content-Type: application/json" \
  --data "{\"name\":\"$PROJECT\",\"production_branch\":\"main\"}" | head -c 400; echo
npx --yes wrangler@3 pages deploy dist --project-name="$PROJECT" --branch=main --commit-dirty=true
