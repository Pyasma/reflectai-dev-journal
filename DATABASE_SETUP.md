# Database Setup Guide - Fix "Failed to Save Settings" Error

## The Problem
You're getting "Failed to save settings" because the database tables don't exist yet.

## The Solution

### Step 1: Run the Database Migration

**Option A - Supabase Dashboard (Recommended):**

1. Go to: https://supabase.com/dashboard
2. Select your project
3. Click **"SQL Editor"** in the left sidebar
4. Click **"New query"** button
5. Open the file `supabase/migrations/20250114000000_initial_schema.sql` in your project
6. **Copy ALL the contents** (it's a long file - about 300 lines)
7. **Paste it** into the SQL Editor
8. Click **"Run"** (or press Ctrl+Enter)
9. Wait for completion - you should see: **"Success. No rows returned"**

**Option B - Using Supabase CLI:**

```bash
# Install Supabase CLI if you haven't
npm install -g supabase

# Login to Supabase
supabase login

# Link your project
supabase link --project-ref YOUR-PROJECT-ID

# Push migration
supabase db push
```

### Step 2: Verify Tables Were Created

After running the migration, verify the tables exist:

1. In Supabase Dashboard, go to **"Table Editor"**
2. You should see these tables:
   - ✅ `users`
   - ✅ `user_settings`
   - ✅ `repositories`
   - ✅ `journal_entries`
   - ✅ `entry_commits`

### Step 3: Test the Settings Page

1. Refresh your app at http://localhost:3000
2. Go to **Settings** page
3. Try saving your API key again
4. It should now work! ✅

---

## Common Errors & Solutions

### Error: "relation 'user_settings' does not exist"
**Cause:** Migration not run or failed

**Fix:**
1. Go to Supabase SQL Editor
2. Run the migration SQL again
3. Check for any error messages in the output
4. If you see errors, they'll tell you what's wrong

---

### Error: "permission denied for table user_settings"
**Cause:** Row Level Security (RLS) policies not created

**Fix:**
1. The migration should create RLS policies automatically
2. If it didn't work, run the migration SQL again
3. Check Supabase → Authentication → Policies to verify RLS is enabled

---

### Error: "duplicate key value violates unique constraint"
**Cause:** Trying to create a duplicate entry

**Fix:**
This is actually normal - it means the table exists and has data. The app should handle this with `upsert`.

---

### Error: "invalid input syntax for type uuid"
**Cause:** User ID format issue

**Fix:**
1. Make sure you're logged in (sign in with GitHub first)
2. Check browser console for the actual user ID
3. Verify the migration created the `users` table correctly

---

## Manual Verification Steps

### Check if migration ran successfully:

```sql
-- Run this in Supabase SQL Editor
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

**You should see:**
- entry_commits
- journal_entries
- repositories
- user_settings
- users

### Check if your user exists:

```sql
-- Run this in Supabase SQL Editor
SELECT id, github_username, created_at 
FROM users 
LIMIT 5;
```

If you see your user, the tables are working!

---

## Still Not Working?

### Get detailed error:

1. Open browser console (F12)
2. Go to Settings page
3. Try to save
4. Look for error messages in console
5. Share the error message for help

### Check Supabase logs:

1. Supabase Dashboard → Logs
2. Select "Postgres Logs"
3. Look for recent errors
4. They'll tell you exactly what's wrong

---

## Next Steps After Database Setup

Once the migration is complete:

1. ✅ Sign in with GitHub (make sure GitHub provider is enabled!)
2. ✅ Go to Settings
3. ✅ Add your Gemini API key
4. ✅ Choose your preferred model
5. ✅ Save settings
6. ✅ Start creating journal entries!

---

**Need the migration file?**
It's in your project: `supabase/migrations/20250114000000_initial_schema.sql`

**Need help with Supabase?**
Check their docs: https://supabase.com/docs
