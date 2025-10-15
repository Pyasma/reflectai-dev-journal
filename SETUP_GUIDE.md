# Quick Setup Guide - Fix GitHub Provider Error

## Problem
You're seeing "GitHub provider not provided" because GitHub OAuth hasn't been configured in Supabase.

## Solution (5 minutes)

### 1️⃣ Create GitHub OAuth App

**Visit:** https://github.com/settings/developers

**Click:** OAuth Apps → New OAuth App

**Fill in:**
- **Application name:** ReflectAI Dev
- **Homepage URL:** http://localhost:3000
- **Callback URL:** https://YOUR-SUPABASE-PROJECT-ID.supabase.co/auth/v1/callback

**Save these:**
- ✅ Client ID
- ✅ Client Secret (generate and copy immediately)

---

### 2️⃣ Configure Supabase

**Visit:** https://supabase.com/dashboard

**Navigate to:** Your Project → Authentication → Providers

**Enable GitHub:**
1. Toggle GitHub ON
2. Paste your Client ID
3. Paste your Client Secret
4. Click Save

**Verify the callback URL matches GitHub**

---

### 3️⃣ Set Environment Variables

**Create `.env.local` file:**

```bash
# Get these from Supabase Dashboard → Settings → API
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...your-key...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...your-service-key...

# Generate with: openssl rand -base64 32
SUPABASE_DB_ENCRYPTION_KEY=randomly-generated-32-char-string

# From your GitHub OAuth App (Step 1)
GITHUB_CLIENT_ID=Iv1.xxxxxxxxxxxx
GITHUB_CLIENT_SECRET=xxxxxxxxxxxx

# Keep as is for local development
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

---

### 4️⃣ Run Database Migration

**In Supabase SQL Editor**, run:

```sql
-- Copy the entire contents from:
-- supabase/migrations/20250114000000_initial_schema.sql
```

Or use Supabase CLI:
```bash
supabase db push
```

---

### 5️⃣ Start the App

```bash
npm run dev
```

Visit: http://localhost:3000

---

## Troubleshooting

### Error: "Invalid callback URL"
- ✅ Make sure the callback URL in GitHub OAuth App matches Supabase exactly
- ✅ Format: `https://YOUR-PROJECT-ID.supabase.co/auth/v1/callback`

### Error: "Environment variables not found"
- ✅ Make sure `.env.local` exists in project root
- ✅ Restart the dev server after creating `.env.local`

### Error: "Database error"
- ✅ Run the migration SQL in Supabase SQL Editor
- ✅ Check that all tables were created

### Still having issues?
1. Check Supabase logs: Dashboard → Logs
2. Check browser console for errors
3. Verify all environment variables are set correctly

---

## Where to Find Things

**Supabase URL & Keys:**
Dashboard → Settings → API

**GitHub OAuth Callback:**
Dashboard → Authentication → Providers → GitHub

**Database Migration:**
File: `supabase/migrations/20250114000000_initial_schema.sql`

---

You're all set! 🚀
