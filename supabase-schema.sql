create table public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  role text check (role in ('job_seeker', 'admin')) default 'job_seeker',
  status text default 'active', -- active, banned, deleted
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table public.profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade unique,
  avatar_url text,
  phone text,
  location text,
  job_preferences jsonb, -- { "salary": "100k+", "types": ["remote", "full-time"] }
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

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
  id uuid primary key default gen_random_uuid(),
  company_id uuid references public.companies(id) on delete set null,
  title text not null,
  description text,
  location text,
  department text,
  employment_type text, -- full-time, part-time, contract
  remote_type text, -- remote, hybrid, onsite
  salary_range text,
  application_url text, -- for external ATS
  source_url text, -- original job board link
  ats_type text, -- greenhouse, lever, workday...
  external_job_id text, -- job_id from ATS
  date_posted timestamptz,
  scraped_at timestamptz,
  status text default 'open', -- open, closed, hidden
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

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
  -- Insert into users table
  INSERT INTO public.users (id, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', NEW.email));

  -- Insert into profiles table
  INSERT INTO public.profiles (user_id, avatar_url)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'avatar_url');

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call the function on new user in auth.users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
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

-- RLS Policies for users
CREATE POLICY "Users can view own user data" ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own user data" ON public.users FOR UPDATE USING (auth.uid() = id);

-- RLS Policies for profiles
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);

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
