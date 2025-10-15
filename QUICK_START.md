# Quick Setup Guide - Fix GitHub Provider Error

## The Problem
You're seeing "GitHub provider not provided" because:
- GitHub OAuth hasn't been configured in your Supabase project yet

## The Solution (Follow these 5 steps)

### Step 1: Create GitHub OAuth App

1. Visit: https://github.com/settings/developers
2. Click: **OAuth Apps** → **New OAuth App**
3. Fill in:
   - Application name: `ReflectAI Dev`
   - Homepage URL: `http://localhost:3000`
   - Callback URL: `https://YOUR-PROJECT-ID.supabase.co/auth/v1/callback`
   
   ⚠️ Replace `YOUR-PROJECT-ID` with your Supabase project reference

4. After creating, save these:
   - **Client ID**
   - **Client Secret** (click "Generate a new client secret")

### Step 2: Enable GitHub in Supabase

1. Go to: https://supabase.com/dashboard
2. Select your project
3. Navigate: **Authentication** → **Providers**
4. Find **GitHub** and toggle it **ON**
5. Paste your **Client ID** and **Client Secret** from Step 1
6. Click **Save**

### Step 3: Create .env.local File

Create a file named `.env.local` in your project root:

```env
# From Supabase Dashboard → Settings → API
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Generate with: openssl rand -base64 32
SUPABASE_DB_ENCRYPTION_KEY=your-random-string

# From GitHub OAuth App (Step 1)
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret

# Keep these as is
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

### Step 4: Run Database Migration

1. Go to Supabase Dashboard → **SQL Editor**
2. Click **New Query**
3. Open `supabase/migrations/20250114000000_initial_schema.sql`
4. Copy all contents and paste into SQL Editor
5. Click **Run**

### Step 5: Start the App

```bash
npm run dev
```

Visit: http://localhost:3000 and click "Sign in with GitHub"

## Common Errors & Fixes

### "GitHub provider not provided"
→ Make sure GitHub is enabled in Supabase (Step 2)

### "Invalid callback URL"
→ Callback URLs must match exactly in GitHub and Supabase

### "Environment variables not found"
→ Create `.env.local` in project root and restart server

### "Database error"
→ Run the migration SQL in Supabase SQL Editor (Step 4)

## Checklist

- [ ] GitHub OAuth App created
- [ ] GitHub provider enabled in Supabase  
- [ ] `.env.local` file created with all values
- [ ] Database migration run
- [ ] Dev server restarted

---

You're ready! 🚀
