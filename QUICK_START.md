# Fix "GitHub Provider Not Provided" Error

## Quick 5-Step Setup

### 1. Create GitHub OAuth App
- Visit: https://github.com/settings/developers
- New OAuth App
- Homepage: `http://localhost:3000`
- Callback: `https://YOUR-PROJECT-ID.supabase.co/auth/v1/callback`
- Save Client ID & Client Secret

### 2. Enable GitHub in Supabase
- Dashboard → Authentication → Providers
- Toggle GitHub ON
- Enter Client ID & Secret
- Save

### 3. Create .env.local
```bash
cp .env.example .env.local
# Then edit with your actual values
```

### 4. Run Database Migration
- Supabase Dashboard → SQL Editor
- Copy contents from `supabase/migrations/20250114000000_initial_schema.sql`
- Run in SQL Editor

### 5. Start App
```bash
npm run dev
```

## Still Having Issues?

Check that:
- GitHub is toggled ON in Supabase
- Callback URLs match exactly
- `.env.local` has all required values
- Database migration completed without errors
- You restarted dev server after creating `.env.local`
