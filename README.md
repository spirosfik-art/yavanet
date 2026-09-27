# Yavanet – οδηγός εγκατάστασης

Ειδησεογραφικό site για την Ελλάδα, για Ισραηλινούς. Εβραϊκά (κύρια γλώσσα) και αγγλικά. Γράφει και δημοσιεύει άρθρα αυτόματα με τεχνητή νοημοσύνη, από επίσημες πηγές.

## Τι κάνει

**Site**
- Αρχική με «ζωντανό ουρανό» (αλλάζει με την ώρα της Αθήνας), κύματα, stories, feed σαν TikTok, μπάρα έκτακτων, μενού στο κάτω μέρος, κουμπί WhatsApp, αυτόματο dark mode τη νύχτα.
- Ενότητες: Ισραηλινοί στην Ελλάδα, Ακίνητα & Κυβέρνηση, Έκτακτα, Πολιτική & Οικονομία, Ταξίδια, Ζώντας στην Ελλάδα, Εβραϊκή Ελλάδα.
- Άρθρα με «Σε 30 δευτερόλεπτα», «Τι σημαίνει για εσένα», ανάγνωση φωναχτά, swipe για το επόμενο, κοινοποίηση WhatsApp, «Αναφέρετε λάθος».
- Εργαλεία: κόστος αγοράς ακινήτου (€ και ₪, με ζωντανή ισοτιμία), απόδοση Airbnb, ειδοποιήσεις για νέους νόμους.
- Σελίδα «Έκτακτα live» με χάρτη, κατάλογος ισραηλινών επιχειρήσεων, σελίδα συμβούλου ακινήτων, «Ρωτήστε τον ειδικό».
- Ζωντανά: καιρός 5 πόλεων (Open-Meteo), ευρώ/σέκελ (ΕΚΤ), ώρες Σαββάτου (Hebcal).
- SEO: sitemap, Google News sitemap, RSS, schema NewsArticle, hreflang. PWA: εγκατάσταση στο κινητό σαν εφαρμογή.
- Banner cookies με τρία ίσα κουμπιά. Το Google Analytics και το Microsoft Clarity φορτώνουν **μόνο** μετά από συγκατάθεση. Νομικές σελίδες σε δύο γλώσσες.

**Αυτοματοποίηση (κάθε 15 λεπτά)**
1. Ελέγχει τις πηγές (`automation/sources.json`).
2. Η AI διαλέγει τα θέματα με βάση τις προτεραιότητες (στόχος 8–15 άρθρα τη μέρα).
3. Η AI γράφει πρωτότυπο άρθρο σε εβραϊκά και αγγλικά.
4. Έλεγχοι: κάθε αριθμός υπάρχει στην πηγή, ομοιότητα με την πηγή κάτω από 20%, δεύτερη AI κάνει έλεγχο γεγονότων και κανόνων διπλωματίας.
5. Δημοσίευση:
   - κανονικά θέματα: αμέσως
   - έκτακτα: αμέσως, μόνο από επίσημη πηγή
   - ευαίσθητα: σου έρχεται μήνυμα στο Telegram με κουμπιά «Δημοσίευση / Απόρριψη / Αλλαγή». Αν δεν απαντήσεις σε 2 ώρες, δημοσιεύεται σύντομη ουδέτερη εκδοχή μόνο με τα επίσημα γεγονότα.
6. Ανάρτηση στο κανάλι Telegram, και σε Facebook/Instagram/X μέσω Make.com (προαιρετικά).
7. Αν αλλάξει η πηγή, το άρθρο ενημερώνεται με «Ενημερώθηκε».
8. Newsletter κάθε πρωί 8:00 ώρα Ισραήλ και κάθε Κυριακή «Ακίνητα την εβδομάδα».
9. Ημερήσια αναφορά (Telegram + email) και μηνιαία αναφορά επαφών.

**Επαφές (CRM)**: κάθε φόρμα καταγράφεται στο Brevo με όνομα, στοιχεία, χώρα, από ποιο άρθρο ήρθε, περιοχή και προϋπολογισμό, και σου έρχεται αμέσως email και Telegram. Την κατάσταση (Νέα / Σε επικοινωνία / Πελάτης / Χαμένη) την αλλάζεις στο Brevo, στο πεδίο `LEAD_STATUS`.

## Ξεκίνημα με 0€

Το site στήνεται **χωρίς κανένα κόστος** και αναβαθμίζεται όταν αρχίσει να φέρνει κόσμο:

| Τώρα (0€) | Αργότερα (όταν έχει κίνηση) |
|---|---|
| Διεύθυνση `yavanet.pages.dev` (δωρεάν από το Cloudflare) | Δικό σας domain, π.χ. yavanet.com (~€10–15/χρόνο). Απαραίτητο για AdSense και Google News |
| AI: **Google Gemini, δωρεάν επίπεδο** (`GEMINI_API_KEY`) | AI: Claude API (`ANTHROPIC_API_KEY`), για καλύτερα εβραϊκά και πιο αυστηρούς ελέγχους |
| Brevo δωρεάν: έως 300 email τη μέρα | Πληρωμένο πλάνο Brevo όταν οι συνδρομητές ξεπεράσουν τους ~300 |
| Χωρίς Make.com, με ανάρτηση μόνο στο κανάλι Telegram | Make.com για Facebook / Instagram / X |
| Εικονογραφήσεις του site + Pexels (δωρεάν) | Ίδιο |

Η αλλαγή από Gemini σε Claude γίνεται χωρίς αλλαγή κώδικα: προσθέτεις το `ANTHROPIC_API_KEY` στα Secrets και βάζεις `AI_PROVIDER=claude`.

**Δύο πράγματα να ξέρεις για το δωρεάν Gemini:**
- Η Google μπορεί να χρησιμοποιεί ό,τι στέλνεται στο δωρεάν επίπεδο για να βελτιώνει τα μοντέλα της. Στο Gemini στέλνονται **μόνο** δημόσιες ειδήσεις από τις πηγές, ποτέ στοιχεία επαφών ή αναγνωστών, οπότε δεν υπάρχει θέμα προσωπικών δεδομένων.
- Τα όρια αιτημάτων του δωρεάν επιπέδου αλλάζουν κατά καιρούς. Αν ξεπεραστούν, το σύστημα απλώς ξαναδοκιμάζει στην επόμενη εκτέλεση. Τα τρέχοντα όρια είναι στο ai.google.dev/gemini-api/docs/rate-limits.

## Τι χρειάζεσαι (λογαριασμοί)

| Υπηρεσία | Για τι | Κόστος |
|---|---|---|
| GitHub | κώδικας + αυτοματοποίηση | δωρεάν (δημόσιο repository) |
| Cloudflare | hosting, προστασία | δωρεάν (`.pages.dev`) · domain αργότερα ~€10–15/χρόνο |
| Google AI Studio (Gemini API) | συγγραφή άρθρων | δωρεάν επίπεδο |
| Brevo | newsletter, email, CRM | δωρεάν έως 300 email/μέρα |
| Telegram | εγκρίσεις από κινητό, κανάλι | δωρεάν |
| Google Analytics, Microsoft Clarity | στατιστικά, heatmaps | δωρεάν |
| Pexels (προαιρετικό) | φωτογραφίες με ελεύθερη άδεια | δωρεάν |
| *Αργότερα:* Claude API | καλύτερη ποιότητα άρθρων | ~€50–100/μήνα για 10–15 άρθρα/μέρα* |
| *Αργότερα:* Make.com | Facebook / Instagram / X | δωρεάν έως ~€10/μήνα |
| *Αργότερα:* ΑΠΕ-ΜΠΕ | ροή ειδήσεων πρακτορείου | κατόπιν προσφοράς |

\* Εκτίμηση για μοντέλο κατηγορίας Sonnet. Δες τις τρέχουσες τιμές στο anthropic.com/pricing.

**GitHub:** σε ιδιωτικό repository τα δωρεάν λεπτά (2.000/μήνα) δεν φτάνουν για εκτέλεση κάθε 15 λεπτά. Βάλε το repository **δημόσιο**: το περιεχόμενο είναι έτσι κι αλλιώς δημόσιο, και τα κλειδιά μένουν κρυφά στα Secrets. Εναλλακτικά, άλλαξε στο `.github/workflows/pipeline.yml` το `*/15` σε `*/30`.

## Εγκατάσταση βήμα-βήμα

### 1. Στοιχεία εταιρείας
Άνοιξε το `site/config.mjs` και συμπλήρωσε:
- στοιχεία εκδότη
- όνομα εταιρείας για το banner
- κανάλια WhatsApp / Telegram

Στο `content/pages.mjs` συμπλήρωσε τα `[ ]` στις νομικές σελίδες και **δώσ' τες σε δικηγόρο με γνώση GDPR** πριν βγει το site online.

### 2. GitHub
Φτιάξε λογαριασμό και νέο repository `yavanet` (Public). Ανέβασε όλα τα αρχεία του φακέλου.

### 3. Cloudflare
1. Φτιάξε λογαριασμό (δωρεάν).
2. **Workers & Pages → Create → Pages → Upload assets**, όνομα project `yavanet`. Ανέβασε προσωρινά οποιοδήποτε αρχείο· από εκεί και πέρα ανεβαίνει αυτόματα.
3. Το site θα είναι στο `https://<όνομα-project>.pages.dev`. Αν το `yavanet` είναι πιασμένο, το Cloudflare δίνει άλλο όνομα: βάλε αυτό στο `SITE_URL`. *Αργότερα:* αγόρασε domain από το **Domain Registration** και πρόσθεσέ το στο **Custom domains**.
4. **Settings → Environment variables** (για τις φόρμες), πρόσθεσε:
   - `BREVO_API_KEY`
   - `BREVO_NL_LIST_HE`, `BREVO_NL_LIST_EN`
   - `BREVO_DOI_TEMPLATE_HE`, `BREVO_DOI_TEMPLATE_EN`
   - `BREVO_LEADS_LIST`
   - `NOTIFY_EMAIL` (όπου έρχονται οι επαφές), `SENDER_EMAIL`
   - `TELEGRAM_BOT_TOKEN`, `TELEGRAM_OWNER_CHAT_ID`
5. (Προαιρετικό) **KV namespace** `CONSENT_LOG`, συνδεδεμένο στο project, για αρχείο συγκαταθέσεων cookies.
6. **My Profile → API Tokens → Create Token → «Edit Cloudflare Workers»** (ή custom με Pages: Edit). Κράτα το token και το **Account ID**.

### 4. Gemini API (δωρεάν)
Στο aistudio.google.com πάτα **Get API key → Create API key**. Μην ενεργοποιήσεις χρέωση (billing), ώστε να μένει δωρεάν.

*Αργότερα, για Claude:* στο console.anthropic.com φτιάξε API key, βάλε όριο μηνιαίας χρέωσης και πρόσθεσέ το ως `ANTHROPIC_API_KEY` με `AI_PROVIDER=claude`.

### 5. Telegram
1. Στο Telegram άνοιξε το **@BotFather** → `/newbot` → κράτα το token.
2. Στείλε ένα μήνυμα στο bot σου. Άνοιξε `https://api.telegram.org/bot<TOKEN>/getUpdates` και κράτα το `chat.id`: αυτό είναι το `TELEGRAM_OWNER_CHAT_ID`.
3. Φτιάξε κανάλι (π.χ. @yavanet) και βάλε το bot διαχειριστή. Το `TELEGRAM_CHANNEL_ID` είναι `@yavanet`.

### 6. Brevo
1. Λογαριασμός (δωρεάν) και επιβεβαίωση email αποστολέα (Senders & Domains). Μέχρι να πάρεις domain αρκεί ένα Gmail, π.χ. yavanet.news@gmail.com.
2. **Contacts → Lists**: φτιάξε 3 λίστες (`Newsletter HE`, `Newsletter EN`, `Leads`) και κράτα τα IDs.
3. **Contacts → Settings → Contact attributes** (Text): `LANG`, `SIGNUP_PAGE`, `CONSENT_AT`, `LEAD_KIND`, `LEAD_SOURCE`, `AREA`, `BUDGET`, `LEAD_STATUS`, `COUNTRY`, `LEAD_AT`, `SMS_TEXT`.
4. **Templates**: δύο templates επιβεβαίωσης εγγραφής (Double opt-in), εβραϊκά και αγγλικά. Κράτα τα IDs.
5. **SMTP & API → API Keys**: φτιάξε κλειδί.

### 7. Στατιστικά
- **Google Analytics 4**: φτιάξε property και κράτα το Measurement ID (G-XXXX).
- **Microsoft Clarity**: φτιάξε project και κράτα το ID.

### 8. GitHub Secrets & Variables
Repository → **Settings → Secrets and variables → Actions**.

**Secrets**
- `GEMINI_API_KEY` (αργότερα: `ANTHROPIC_API_KEY`)
- `TELEGRAM_BOT_TOKEN`, `TELEGRAM_OWNER_CHAT_ID`, `TELEGRAM_CHANNEL_ID`
- `BREVO_API_KEY`
- `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`
- προαιρετικά: `PEXELS_API_KEY`, `MAKE_WEBHOOK_URL`

**Variables**
- `SITE_URL` = https://yavanet.pages.dev (αργότερα το δικό σου domain)
- `AI_PROVIDER` = gemini
- `CF_PROJECT` = yavanet
- `GA4_ID`, `CLARITY_ID`
- `BREVO_NL_LIST_HE`, `BREVO_NL_LIST_EN`, `BREVO_LEADS_LIST`
- `SENDER_EMAIL`, `NOTIFY_EMAIL`
- προαιρετικά:
  - `GEMINI_MODEL` (προεπιλογή `gemini-2.5-flash`)
  - `ANTHROPIC_MODEL` (προεπιλογή `claude-sonnet-5`)
  - `SELECT_MODEL` (προεπιλογή `claude-haiku-4-5-20251001`)
  - `MAX_PER_DAY` (15), `MIN_PER_DAY` (8)

### 9. Πρώτη εκκίνηση
1. **Actions → Deploy → Run workflow**: ανεβαίνει το site.
2. **Actions → Content pipeline → Run workflow**: πρώτη συλλογή και άρθρα. Από εκεί και πέρα τρέχει μόνο του.
3. Γράψε `/status` στο bot του Telegram.

### 10. Google
- **Search Console**: πρόσθεσε το site και υπόβαλε τα `sitemap.xml` και `news-sitemap.xml`.
- **Google News Publisher Center** και **AdSense**: όταν πάρεις δικό σου domain. Και τα δύο θέλουν δικό σου domain και μερικές εβδομάδες τακτικών άρθρων.

## Εντολές Telegram (μόνο από τον ιδιοκτήτη)

| Εντολή | Τι κάνει |
|---|---|
| `/status` | τι δημοσιεύτηκε σήμερα, τι περιμένει έγκριση |
| `/pause` · `/resume` | παύση / συνέχεια αυτόματης δημοσίευσης |
| `/approve ID` · `/reject ID` | έγκριση / απόρριψη ευαίσθητου άρθρου (υπάρχουν και κουμπιά) |
| `/edit ID οδηγία` | ξαναγράφει το άρθρο με την οδηγία σου |
| `/remove slug` | κατεβάζει άρθρο από το site |
| `/story URL` | γράφει άρθρο από όποιον σύνδεσμο στείλεις |

## Αλλαγές που μπορείς να κάνεις μόνος σου

- **Πηγές**: `automation/sources.json`. Έλεγχος με `npm run check-sources`.
- **Κανόνες ύφους & διπλωματίας**: `automation/prompts.mjs`.
- **Κείμενα του site**: `site/config.mjs`.
- **Design**: `site/assets/styles.css`.
- **Κατάλογος επιχειρήσεων**: `content/businesses.json`, με μορφή:
  ```json
  { "name": "", "city": "", "he": "", "en": "", "url": "", "featured": false }
  ```
- **Διόρθωση άρθρου**: άνοιξε το αρχείο του στο `content/articles/` μέσα από το GitHub, ακόμα και από το κινητό.

Τοπική προεπισκόπηση: `npm run preview` → http://localhost:8080 (Node 20+, χωρίς άλλα πακέτα).

## Τι δεν περιλαμβάνεται ακόμα

- **Push ειδοποιήσεις**: το site εγκαθίσταται ήδη σαν εφαρμογή. Για ειδοποιήσεις push προτείνεται το OneSignal (δωρεάν), ως επόμενο βήμα.
- **3D χάρτης τιμών ακινήτων**: θέλει πηγή τιμών ανά περιοχή. Επόμενο βήμα.
- **Κανάλι WhatsApp**: το WhatsApp δεν έχει δημόσιο API για κανάλια, οπότε οι αναρτήσεις εκεί γίνονται χειροκίνητα ή μέσω εξωτερικής υπηρεσίας.
- **«Τα πιο διαβασμένα»**: δείχνει τα πιο πρόσφατα. Για πραγματικά στοιχεία από το GA4, συμπλήρωσε το `content/mostread.json`, ή σύνδεσέ το αργότερα με το GA4 Data API.
- **Διαφημίσεις τρίτων (AdSense κ.λπ.)**: υπάρχουν οι θέσεις και η συγκατάθεση. Ο κώδικας του δικτύου μπαίνει όταν εγκριθεί το site.

## Άμεσο Telegram bot

Με το secret `GH_DISPATCH_TOKEN` (GitHub fine-grained token, μόνο για το repository `yavanet`, δικαίωμα **Actions: Read and write**) το bot απαντά αμέσως: κάθε πάτημα κουμπιού ή εντολή ξεκινά αμέσως την εκτέλεση στο GitHub και το αποτέλεσμα είναι στο site σε ~2 λεπτά. Το webhook ρυθμίζεται αυτόματα σε κάθε «Deploy». Χωρίς το κλειδί, το bot διαβάζει τα μηνύματα κάθε 15 λεπτά.
