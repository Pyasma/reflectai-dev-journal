# ReflectAI - AI-Powered Developer Journal

ReflectAI is a full-stack web application that helps developers automatically log and reflect on their coding sessions. Using Google Gemini AI, it generates insightful summaries of your work, extracts lessons learned, and suggests next steps.

## Features

- **GitHub OAuth Authentication** - Secure login with your GitHub account
- **Repository Sync** - Automatically sync your public GitHub repositories
- **Manual Journal Entries** - Create entries on your terms with full control
- **AI-Powered Summaries** - Gemini AI generates professional summaries and technical details
- **Rich Text Editor** - Write lessons learned and next steps with formatting
- **Timeline View** - Visualize your development journey chronologically
- **Statistics Dashboard** - Track your activity with detailed analytics
- **Search Functionality** - Full-text search across all your entries
- **Customizable AI** - Choose your Gemini model and customize the system prompt

## Tech Stack

- **Frontend**: Next.js 15 with App Router, React 19, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui components
- **Database**: Supabase (PostgreSQL)
- **Authentication**: GitHub OAuth via Supabase Auth
- **AI**: Google Gemini API
- **GitHub Integration**: Octokit
- **Rich Text**: Tiptap
- **Charts**: Recharts
- **Deployment**: Netlify (recommended)

## Prerequisites

- Node.js 20+ and npm
- GitHub account
- Supabase account
- Google Gemini API key (free tier available)

## Setup Instructions

### 1. Clone the Repository

```bash
git clone <repository-url>
cd reflectai-dev-journal
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Navigate to Project Settings > API
3. Copy your project URL and anon key
4. Go to SQL Editor and run the migration script at `supabase/migrations/20250114000000_initial_schema.sql`

### 4. Configure GitHub OAuth

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Create a new OAuth App:
   - Application name: `ReflectAI`
   - Homepage URL: `http://localhost:3000` (for development)
   - Authorization callback URL: `https://your-project.supabase.co/auth/v1/callback`
3. Copy the Client ID and Client Secret
4. In Supabase Dashboard:
   - Go to Authentication > Providers
   - Enable GitHub provider
   - Paste your Client ID and Client Secret
   - Set the callback URL

### 5. Get Gemini API Key

1. Visit [Google AI Studio](https://ai.google.dev/)
2. Sign in with your Google account
3. Create a new API key
4. Copy the key (you'll enter this in the app's settings page)

### 6. Configure Environment Variables

Create a `.env.local` file in the root directory:

```bash
cp .env.example .env.local
```

Fill in the values:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Database Encryption (for API keys)
# Generate with: openssl rand -base64 32
SUPABASE_DB_ENCRYPTION_KEY=your-random-32-char-secret

# GitHub OAuth (if needed for direct API calls)
GITHUB_CLIENT_ID=your-github-oauth-client-id
GITHUB_CLIENT_SECRET=your-github-oauth-secret

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Node Environment
NODE_ENV=development
```

### 7. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage Guide

### First-Time Setup

1. **Sign in with GitHub** - Click the "Sign in with GitHub" button on the landing page
2. **Add Gemini API Key** - Navigate to Settings and enter your Gemini API key
3. **Sync Repositories** - The app will automatically sync your public GitHub repositories
4. **Create Your First Entry** - Click "New Entry" to start journaling

### Creating a Journal Entry

1. **Select Repository** - Choose the repository you worked on
2. **Choose Session Type** - Select from Development, Maintenance, or Planning
3. **Write Your Message** - Describe what you worked on and what you accomplished
4. **Review Commits** - The app automatically fetches commits since your last entry
5. **Generate AI Summary** - Click to let Gemini AI create a professional summary
6. **Edit Sections** - Review and edit the AI-generated summary and technical details
7. **Add Lessons Learned** - Use the rich text editor to document your insights
8. **Add Next Steps** - Plan what needs to be done next
9. **Save Entry** - Click "Save Entry" to add it to your journal

### Viewing Your Journal

- **Dashboard** - View all entries in a timeline format
- **Filter** - Use the filter bar to search and filter by repository or type
- **Statistics** - Check your activity metrics and most active repositories
- **Search** - Full-text search across all your entries

### Customizing AI Behavior

Go to Settings to:
- Choose your preferred Gemini model (Pro, Flash, Flash-8B, or Experimental)
- Customize the system prompt for AI generation
- Update your API key

## Project Structure

```
reflectai-dev-journal/
├── app/
│   ├── api/                    # API routes
│   │   ├── gemini/             # AI generation endpoint
│   │   ├── github/             # GitHub API integration
│   │   └── entries/            # Entry search
│   ├── auth/                   # OAuth callback
│   ├── dashboard/              # Main dashboard
│   │   ├── new-entry/          # Entry creation form
│   │   └── page.tsx            # Timeline view
│   ├── settings/               # Settings page
│   ├── statistics/             # Statistics dashboard
│   ├── page.tsx                # Landing page
│   ├── layout.tsx              # Root layout
│   └── globals.css             # Global styles
├── components/
│   ├── dashboard/              # Dashboard components
│   │   ├── Timeline.tsx
│   │   ├── EntryCard.tsx
│   │   └── FilterBar.tsx
│   ├── editor/                 # Rich text editor
│   │   └── TiptapEditor.tsx
│   └── ui/                     # shadcn/ui components
├── lib/
│   ├── supabase/               # Supabase clients
│   ├── github-client.ts        # GitHub API wrapper
│   └── utils.ts                # Utility functions
├── supabase/
│   └── migrations/             # Database migrations
├── middleware.ts               # Auth middleware
└── tailwind.config.ts          # Tailwind configuration
```

## Deployment

### Deploy to Netlify

#### Prerequisites

1. Ensure `netlify.toml` exists in repository root (contains plugin configuration)
2. Verify GitHub OAuth callback URL includes your Netlify domain
3. Verify Supabase redirect URLs include your Netlify domain

#### Build Settings

Netlify will automatically detect settings from netlify.toml:
- **Build command**: `npm run build` (from netlify.toml)
- **Publish directory**: `.next` (from netlify.toml)
- **Next.js Plugin**: Automatically applied (from netlify.toml)

#### Environment Variables

Add all environment variables from your `.env.local` to Netlify dashboard (Site settings → Environment variables):
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_DB_ENCRYPTION_KEY`
- `GITHUB_CLIENT_ID` (if using GitHub features)
- `GITHUB_CLIENT_SECRET` (if using GitHub features)
- `NODE_ENV` (set to "production")

#### Deployment

1. Connect repository to Netlify
2. Netlify will automatically use netlify.toml configuration
3. Deploy will build Next.js app with plugin support
4. Middleware and API routes will work in production

#### Verification

After deployment:
1. Navigate to your Netlify URL
2. Click "Continue with GitHub"
3. Complete OAuth flow
4. Should redirect to /dashboard successfully
5. Test protected routes (/dashboard, /settings, /statistics)

## Troubleshooting

### OAuth Callback Errors
- Verify callback URLs match exactly in GitHub and Supabase settings
- Check that environment variables are set correctly

### Gemini API Errors
- Ensure your API key is valid and has not exceeded rate limits
- Check that you've selected an appropriate model in settings

### Repository Sync Issues
- Make sure you've granted the correct GitHub OAuth scopes
- Try manually syncing repositories using the refresh button

### Database Connection Errors
- Verify Supabase URL and keys are correct
- Check that the database migration has been run successfully

## API Rate Limits

### Gemini API (Free Tier)
- **2.0 Flash Experimental**: Best for testing, variable limits
- **1.5 Flash**: 10 requests/minute, 250 requests/day
- **1.5 Flash-8B**: 15 requests/minute, 1,000 requests/day
- **1.5 Pro**: 5 requests/minute, 100 requests/day

### GitHub API
- Authenticated: 5,000 requests/hour
- The app caches repository data to minimize API calls

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT License - feel free to use this project for your own purposes.

## Support

For issues and questions:
- Create an issue on GitHub
- Check the troubleshooting section above
- Review the Supabase and Next.js documentation

## Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Database by [Supabase](https://supabase.com/)
- AI by [Google Gemini](https://ai.google.dev/)
- Icons from [Lucide](https://lucide.dev/)

---

**Made with ❤️ for developers who want to track and reflect on their coding journey.**
