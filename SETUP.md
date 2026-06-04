# Vansh Chauhan — Appointment System Setup Guide

Follow these steps exactly. Takes ~30 minutes total.

---

## Step 1 — Supabase (Database)

1. Go to https://supabase.com → Sign up (free)
2. Click **New Project** → give it a name → set a DB password → Create
3. Wait ~2 minutes for it to boot
4. Go to **SQL Editor** (left sidebar) → click **New Query**
5. Paste and run this SQL:

```sql
create table appointments (
  id uuid default gen_random_uuid() primary key,
  customer_name text not null,
  phone text not null,
  appointment_time timestamptz not null,
  note text,
  confirmation_sent boolean default false,
  reminder_sent boolean default false,
  created_at timestamptz default now()
);
```

6. Go to **Project Settings → API**
7. Copy:
   - **Project URL** → this is your `SUPABASE_URL`
   - **anon / public key** → this is your `SUPABASE_ANON_KEY`

---

## Step 2 — Twilio WhatsApp (Messaging)

1. Go to https://www.twilio.com → Sign up (free trial gives ~$15 credit)
2. After signup, go to your **Console Dashboard**
3. Copy:
   - **Account SID** → `TWILIO_ACCOUNT_SID`
   - **Auth Token** → `TWILIO_AUTH_TOKEN`

### Enable WhatsApp Sandbox:
4. In the left sidebar go to **Messaging → Try it out → Send a WhatsApp message**
5. Follow the instructions: send a WhatsApp message like `join <your-sandbox-word>` to `+1 415 523 8886`
6. Once joined, your `TWILIO_WHATSAPP_FROM` is: `whatsapp:+14155238886`

> Note: The sandbox only works for numbers that have joined it (for testing).
> For production, you'll need to apply for a WhatsApp Business sender — takes 1-2 days via Twilio.

---

## Step 3 — Set up .env locally

Copy `.env.example` to `.env` and fill in your values:

```
SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGci...
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886
PORT=3000
```

---

## Step 4 — Run locally to test

```bash
npm install
npm run dev
```

Open http://localhost:3000 — book an appointment. Check your WhatsApp!

---

## Step 5 — Deploy to Vercel

### 5a. Push to GitHub
```bash
git init
git add .
git commit -m "initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/vansh-appointments.git
git push -u origin main
```

### 5b. Deploy on Vercel
1. Go to https://vercel.com → Sign in with GitHub
2. Click **Add New → Project**
3. Import your `vansh-appointments` repo
4. Click **Environment Variables** and add all 5 variables from your `.env` file
5. Click **Deploy**

Done! Vercel gives you a live URL like `https://vansh-appointments.vercel.app`

### 5c. Verify cron is working
- Go to your Vercel dashboard → your project → **Settings → Cron Jobs**
- You should see the `/api/send-reminders` job running every 5 minutes
- This automatically sends WhatsApp reminders for appointments within 1 hour

---

## How it works

| Action | What happens |
|---|---|
| Book appointment | Saved to Supabase + WhatsApp confirmation sent immediately |
| Appointment within 1 hour | Vercel cron fires `/api/send-reminders` every 5 min → WhatsApp reminder sent |
| Dashboard | Auto-refreshes every 30 seconds from the database |

---

## File structure

```
vansh-appointments/
├── public/
│   └── index.html       ← frontend (booking form + dashboard)
│   ├── script.js        ← javascript for backend
│   └── sttyle.css       ← Stylesheet
├── lib/
│   ├── supabase.js      ← database client
│   └── whatsapp.js      ← Twilio WhatsApp helper + message templates
├── server.js            ← Express API (all routes)
├── vercel.json          ← Vercel config + cron schedule
├── package.json
```

## API routes

```
POST   /api/appointments        → create appointment + send confirmation
GET    /api/appointments        → list all appointments
DELETE /api/appointments/:id    → delete one appointment
POST   /api/send-reminders      → called by Vercel cron every 5 min
```
