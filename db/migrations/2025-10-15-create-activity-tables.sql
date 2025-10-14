-- Migration: Create user_job_activity and user_job_activity_summary tables
-- These tables are used to track user interactions with jobs

-- Drop existing tables if they exist (to handle views/tables conflicts)
DROP VIEW IF EXISTS public.user_job_activity_summary;
DROP TABLE IF EXISTS public.user_job_activity CASCADE;
DROP TABLE IF EXISTS public.user_job_activity_summary CASCADE;

CREATE TABLE public.user_job_activity (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid, -- Made nullable to allow anonymous activity tracking
  job_id uuid REFERENCES public.jobs(id) ON DELETE CASCADE,
  activity_type text NOT NULL CHECK (activity_type IN ('view', 'save', 'apply', 'hide')),
  metadata jsonb DEFAULT '{}',
  idempotency_key text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE public.user_job_activity_summary (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid, -- Made nullable to allow anonymous activity tracking
  job_id uuid REFERENCES public.jobs(id) ON DELETE CASCADE,
  views integer DEFAULT 0,
  saves integer DEFAULT 0,
  applies integer DEFAULT 0,
  last_activity_at timestamptz DEFAULT now(),
  UNIQUE (user_id, job_id)
);

-- Enable RLS
ALTER TABLE public.user_job_activity ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_job_activity_summary ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can insert their own activity" ON public.user_job_activity;
DROP POLICY IF EXISTS "Users can view their own activity" ON public.user_job_activity;
DROP POLICY IF EXISTS "Admins can view all activity" ON public.user_job_activity;

-- Policies for user_job_activity
CREATE POLICY "Allow all inserts to user_job_activity" ON public.user_job_activity
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can view their own activity" ON public.user_job_activity
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all activity" ON public.user_job_activity
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

-- Policies for user_job_activity_summary
CREATE POLICY "Allow all operations on user_job_activity_summary" ON public.user_job_activity_summary
  FOR ALL USING (true);

CREATE POLICY "Admins can view all summaries" ON public.user_job_activity_summary
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_job_activity_user_id ON public.user_job_activity(user_id);
CREATE INDEX IF NOT EXISTS idx_user_job_activity_job_id ON public.user_job_activity(job_id);
CREATE INDEX IF NOT EXISTS idx_user_job_activity_created_at ON public.user_job_activity(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_job_activity_summary_user_id ON public.user_job_activity_summary(user_id);
CREATE INDEX IF NOT EXISTS idx_user_job_activity_summary_job_id ON public.user_job_activity_summary(job_id);