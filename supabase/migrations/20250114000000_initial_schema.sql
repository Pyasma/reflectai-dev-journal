-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- TABLES
-- ============================================

-- Users table (extends Supabase auth.users)
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  github_username TEXT,
  github_avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- User settings table (stores API keys and preferences)
CREATE TABLE public.user_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE UNIQUE,
  gemini_api_key TEXT, -- Encrypted
  gemini_model_preference TEXT NOT NULL DEFAULT 'gemini-2.0-flash-exp' CHECK (
    gemini_model_preference IN (
      'gemini-2.0-flash-exp',
      'gemini-2.5-flash',
      'gemini-2.5-pro'
    )
  ),
  custom_system_prompt TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Repositories table (synced from GitHub)
CREATE TABLE public.repositories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  github_repo_id BIGINT NOT NULL,
  name TEXT NOT NULL,
  full_name TEXT NOT NULL,
  description TEXT,
  html_url TEXT NOT NULL,
  language TEXT,
  is_private BOOLEAN NOT NULL DEFAULT false,
  last_synced_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, github_repo_id)
);

-- Journal entries table (main session logs)
CREATE TABLE public.journal_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  repository_id UUID NOT NULL REFERENCES public.repositories(id) ON DELETE CASCADE,
  session_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  command_type TEXT NOT NULL CHECK (command_type IN ('development', 'maintenance', 'planning')),
  user_message TEXT NOT NULL,
  ai_summary TEXT,
  ai_technical_details TEXT,
  user_lessons_learned TEXT,
  user_next_steps TEXT,
  gemini_model_used TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Entry commits table (tracks which commits are included in each entry)
CREATE TABLE public.entry_commits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  entry_id UUID NOT NULL REFERENCES public.journal_entries(id) ON DELETE CASCADE,
  commit_sha TEXT NOT NULL,
  commit_message TEXT NOT NULL,
  commit_author TEXT,
  commit_date TIMESTAMPTZ NOT NULL,
  files_changed INTEGER,
  additions INTEGER,
  deletions INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(entry_id, commit_sha)
);

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX idx_repositories_user_id ON public.repositories(user_id);
CREATE INDEX idx_repositories_github_repo_id ON public.repositories(github_repo_id);
CREATE INDEX idx_journal_entries_user_id ON public.journal_entries(user_id);
CREATE INDEX idx_journal_entries_repository_id ON public.journal_entries(repository_id);
CREATE INDEX idx_journal_entries_session_date ON public.journal_entries(session_date DESC);
CREATE INDEX idx_journal_entries_command_type ON public.journal_entries(command_type);
CREATE INDEX idx_entry_commits_entry_id ON public.entry_commits(entry_id);
CREATE INDEX idx_entry_commits_commit_sha ON public.entry_commits(commit_sha);

-- Full-text search index for journal entries
CREATE INDEX idx_journal_entries_search ON public.journal_entries
USING gin(to_tsvector('english',
  coalesce(user_message, '') || ' ' ||
  coalesce(ai_summary, '') || ' ' ||
  coalesce(ai_technical_details, '') || ' ' ||
  coalesce(user_lessons_learned, '') || ' ' ||
  coalesce(user_next_steps, '')
));

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.repositories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.entry_commits ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view own profile"
  ON public.users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.users FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.users FOR INSERT
  WITH CHECK (auth.uid() = id);

-- User settings policies
CREATE POLICY "Users can view own settings"
  ON public.user_settings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own settings"
  ON public.user_settings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own settings"
  ON public.user_settings FOR UPDATE
  USING (auth.uid() = user_id);

-- Repositories policies
CREATE POLICY "Users can view own repositories"
  ON public.repositories FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own repositories"
  ON public.repositories FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own repositories"
  ON public.repositories FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own repositories"
  ON public.repositories FOR DELETE
  USING (auth.uid() = user_id);

-- Journal entries policies
CREATE POLICY "Users can view own journal entries"
  ON public.journal_entries FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own journal entries"
  ON public.journal_entries FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own journal entries"
  ON public.journal_entries FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own journal entries"
  ON public.journal_entries FOR DELETE
  USING (auth.uid() = user_id);

-- Entry commits policies (simple direct checks)
CREATE POLICY "Users can view commits for own entries"
  ON public.entry_commits FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.journal_entries
      WHERE journal_entries.id = entry_commits.entry_id
      AND journal_entries.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert commits for own entries"
  ON public.entry_commits FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.journal_entries
      WHERE journal_entries.id = entry_commits.entry_id
      AND journal_entries.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete commits from own entries"
  ON public.entry_commits FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.journal_entries
      WHERE journal_entries.id = entry_commits.entry_id
      AND journal_entries.user_id = auth.uid()
    )
  );

-- ============================================
-- FUNCTIONS
-- ============================================

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to search journal entries (limit: 25 items)
CREATE OR REPLACE FUNCTION search_journal_entries(
  search_query TEXT,
  filter_user_id UUID DEFAULT NULL,
  filter_repository_id UUID DEFAULT NULL,
  filter_command_type TEXT DEFAULT NULL,
  result_limit INTEGER DEFAULT 25
)
RETURNS TABLE (
  id UUID,
  user_id UUID,
  repository_id UUID,
  session_date TIMESTAMPTZ,
  command_type TEXT,
  user_message TEXT,
  ai_summary TEXT,
  created_at TIMESTAMPTZ,
  rank REAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    je.id,
    je.user_id,
    je.repository_id,
    je.session_date,
    je.command_type,
    je.user_message,
    je.ai_summary,
    je.created_at,
    ts_rank(
      to_tsvector('english',
        coalesce(je.user_message, '') || ' ' ||
        coalesce(je.ai_summary, '') || ' ' ||
        coalesce(je.ai_technical_details, '') || ' ' ||
        coalesce(je.user_lessons_learned, '') || ' ' ||
        coalesce(je.user_next_steps, '')
      ),
      plainto_tsquery('english', search_query)
    ) AS rank
  FROM public.journal_entries je
  WHERE
    to_tsvector('english',
      coalesce(je.user_message, '') || ' ' ||
      coalesce(je.ai_summary, '') || ' ' ||
      coalesce(je.ai_technical_details, '') || ' ' ||
      coalesce(je.user_lessons_learned, '') || ' ' ||
      coalesce(je.user_next_steps, '')
    ) @@ plainto_tsquery('english', search_query)
    AND (filter_user_id IS NULL OR je.user_id = filter_user_id)
    AND (filter_repository_id IS NULL OR je.repository_id = filter_repository_id)
    AND (filter_command_type IS NULL OR je.command_type = filter_command_type)
    AND je.user_id = auth.uid() -- Enforce RLS
  ORDER BY rank DESC, je.session_date DESC
  LIMIT result_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get recent activity statistics (7 days)
CREATE OR REPLACE FUNCTION get_recent_activity(
  filter_user_id UUID,
  days_back INTEGER DEFAULT 7
)
RETURNS TABLE (
  total_entries BIGINT,
  total_commits BIGINT,
  repositories_active BIGINT,
  entries_by_type JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(DISTINCT je.id) AS total_entries,
    COUNT(DISTINCT ec.id) AS total_commits,
    COUNT(DISTINCT je.repository_id) AS repositories_active,
    jsonb_object_agg(
      je.command_type,
      count_by_type
    ) AS entries_by_type
  FROM public.journal_entries je
  LEFT JOIN public.entry_commits ec ON je.id = ec.entry_id
  LEFT JOIN LATERAL (
    SELECT COUNT(*) AS count_by_type
    FROM public.journal_entries
    WHERE command_type = je.command_type
    AND user_id = filter_user_id
    AND session_date >= NOW() - (days_back || ' days')::INTERVAL
  ) type_counts ON true
  WHERE
    je.user_id = filter_user_id
    AND je.session_date >= NOW() - (days_back || ' days')::INTERVAL
  GROUP BY je.user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- TRIGGERS
-- ============================================

-- Triggers for updated_at columns
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_settings_updated_at
  BEFORE UPDATE ON public.user_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_repositories_updated_at
  BEFORE UPDATE ON public.repositories
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_journal_entries_updated_at
  BEFORE UPDATE ON public.journal_entries
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- GRANTS
-- ============================================

-- Grant access to authenticated users
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;
