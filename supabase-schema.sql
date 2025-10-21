
create table public.profiles (
  id uuid not null default gen_random_uuid (),
  user_id uuid null,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  role text null default 'job_seeker'::text,
  full_name text null,
  is_blocked boolean null default false,
  constraint profiles_pkey primary key (id),
  constraint profiles_user_id_key unique (user_id),
  constraint profiles_user_id_fkey foreign KEY (user_id) references auth.users (id) on delete CASCADE,
  constraint profiles_role_check check (
    (
      role = any (array['job_seeker'::text, 'admin'::text])
    )
  )
) TABLESPACE pg_default;

create table public.companies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  logo_url text,
  website text,
  size text,
  industry text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table public.jobs (
  id uuid not null default gen_random_uuid (),
  company_id uuid null,
  title text not null,
  description text null,
  location text null,
  department text null,
  employment_type text null,
  remote_type text null,
  salary_range text null,
  application_url text null,
  source_url text null,
  ats_type text null,
  external_job_id text null,
  date_posted timestamp with time zone null,
  scraped_at timestamp with time zone null,
  status text null default 'open'::text,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  experience_level text null,
  job_category text null,
  required_skills text null,
  benefits text null,
  visa_sponsorship text null,
  equity_offered text null,
  salary text null,
  constraint jobs_pkey primary key (id),
  constraint jobs_company_id_fkey foreign KEY (company_id) references companies (id) on delete set null
) TABLESPACE pg_default;

create table public.saved_jobs (
  id uuid primary key default gen_random_uuid(),
  job_id uuid references public.jobs(id) on delete cascade,
  user_id uuid references public.users(id) on delete cascade,
  created_at timestamptz default now(),
  unique (job_id, user_id) -- prevent duplicates
);

create table public.hidden_jobs (
  id uuid primary key default gen_random_uuid(),
  job_id uuid references public.jobs(id) on delete cascade,
  user_id uuid references public.users(id) on delete cascade,
  reason text,
  created_at timestamptz default now(),
  unique (job_id, user_id)
);

create table public.applied_jobs (
  id uuid primary key default gen_random_uuid(),
  job_id uuid references public.jobs(id) on delete cascade,
  user_id uuid references public.users(id) on delete cascade,
  status text default 'applied', -- applied, viewed, interview, rejected
  resume_url text,
  created_at timestamptz default now(),
  unique (job_id, user_id)
);


create table public.saved_searches (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade,
  filters jsonb, -- { "location": "remote", "salary": "100k+" }
  created_at timestamptz default now()
);

create table public.job_views (
  id uuid primary key default gen_random_uuid(),
  job_id uuid references public.jobs(id) on delete cascade,
  user_id uuid references public.users(id) on delete cascade,
  viewed_at timestamptz default now()
);

create table public.reported_jobs (
  id uuid primary key default gen_random_uuid(),
  job_id uuid references public.jobs(id) on delete cascade,
  user_id uuid references public.users(id) on delete cascade,
  reason text,
  created_at timestamptz default now()
);

create table public.site_content (
  id uuid primary key default gen_random_uuid(),
  section text not null, -- homepage, footer, faq
  content jsonb,
  updated_at timestamptz default now()
);

ALTER TABLE public.companies
ADD CONSTRAINT unique_company_name UNIQUE (name);

-- Function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert into profiles table with all user data (users table removed)
  INSERT INTO public.profiles (user_id, full_name, avatar_url, role)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', NEW.email), NEW.raw_user_meta_data->>'avatar_url', 'job_seeker');

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call the function on new user in auth.users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hidden_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applied_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_searches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reported_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;

-- Users table removed, no RLS policies needed for it

-- RLS Policies for profiles
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);

-- Allow admins to view and update all profiles
CREATE POLICY "Admins can view all profiles" ON public.profiles FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admins can update all profiles" ON public.profiles FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role = 'admin')
);

-- RLS Policies for other tables (basic examples, adjust as needed)
CREATE POLICY "Users can view jobs" ON public.jobs FOR SELECT USING (true);
CREATE POLICY "Users can view companies" ON public.companies FOR SELECT USING (true);

CREATE POLICY "Users can manage own saved jobs" ON public.saved_jobs FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own hidden jobs" ON public.hidden_jobs FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own applied jobs" ON public.applied_jobs FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own saved searches" ON public.saved_searches FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own job views" ON public.job_views FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own reported jobs" ON public.reported_jobs FOR ALL USING (auth.uid() = user_id);

-- Allow anyone to view site content
CREATE POLICY "Anyone can view site content" ON public.site_content FOR SELECT USING (true);

