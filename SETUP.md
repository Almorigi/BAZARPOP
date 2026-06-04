# Guida setup BazarPop

## Cosa ti serve (tutto gratuito o a basso costo)
- Account [Supabase](https://supabase.com) — database e storage immagini (gratis)
- Account [Stripe](https://stripe.com) — pagamenti online (gratis, paghi solo le commissioni sulle vendite ~1.5%)
- Account [Vercel](https://vercel.com) — hosting del sito (gratis)

---

## PASSO 1 — Installa Node.js

1. Vai su https://nodejs.org e scarica la versione **LTS**
2. Installala normalmente
3. Apri il Terminale (PowerShell) e lancia:
   ```
   cd "C:\Users\amoro\Desktop\Claude Code\ecommerce-site"
   npm install
   ```

---

## PASSO 2 — Crea il database (Supabase)

1. Vai su https://supabase.com e crea un account gratuito
2. Clicca **New project** → dai un nome (es. "bazarpop") → salva la password
3. Aspetta che il progetto si avvii (~2 min)
4. Nel menu a sinistra clicca **SQL Editor** → **New query**
5. Copia tutto il contenuto del file `supabase/schema.sql` e incollalo → clicca **Run**
6. Vai su **Settings → API** e copia:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role secret** → `SUPABASE_SERVICE_ROLE_KEY` (tienila segreta!)

---

## PASSO 3 — Crea l'account Stripe

1. Vai su https://stripe.com e crea un account
2. Nel dashboard Stripe, vai su **Developers → API keys**
3. Copia:
   - **Publishable key** → `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
   - **Secret key** → `STRIPE_SECRET_KEY`
4. Per il webhook (dopo il deploy su Vercel): vai su **Developers → Webhooks → Add endpoint**
   - URL: `https://tuo-sito.vercel.app/api/webhook`
   - Events: `checkout.session.completed`
   - Copia il **Signing secret** → `STRIPE_WEBHOOK_SECRET`

---

## PASSO 4 — Crea il file .env.local

Nella cartella `ecommerce-site`, crea un file chiamato `.env.local` con questo contenuto (sostituisci i valori):

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

NEXT_PUBLIC_SITE_URL=https://tuo-sito.vercel.app
```

---

## PASSO 5 — Testa in locale

```bash
npm run dev
```
Apri http://localhost:3000 nel browser.

Per aggiungere prodotti vai su http://localhost:3000/admin

---

## PASSO 6 — Pubblica su Vercel (gratis)

1. Vai su https://github.com e crea un account
2. Crea un repository nuovo, carica tutti i file del progetto
3. Vai su https://vercel.com → **New Project** → importa il repository GitHub
4. Nella sezione **Environment Variables** aggiungi tutte le variabili del file `.env.local`
5. Clicca **Deploy** → il sito sarà online in 2 minuti!
6. Prendi l'URL del sito (es. `https://bazarpop.vercel.app`) e aggiornalo in:
   - `.env.local` → `NEXT_PUBLIC_SITE_URL`
   - Dashboard Vercel → Environment Variables

---

## Aggiungere prodotti

Vai su `tuo-sito.vercel.app/admin` per aggiungere prodotti con:
- Titolo, descrizione, prezzo
- Categoria e condizione
- Fino a 5 foto per prodotto

In alternativa puoi gestire i prodotti direttamente dalla dashboard Supabase:
**Table Editor → products**

---

## Dominio personalizzato (opzionale, ~€10/anno)

1. Compra un dominio su https://namecheap.com o https://aruba.it (es. `bazarpop.it`)
2. In Vercel → **Settings → Domains** → aggiungi il dominio
3. Segui le istruzioni per puntare il DNS

---

## Ricevere i pagamenti

I soldi arrivano direttamente sul tuo conto Stripe. 
Per collegare il tuo conto bancario: Dashboard Stripe → **Settings → Payouts**
