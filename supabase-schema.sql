-- Create jobs table
CREATE TABLE jobs (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  salary TEXT,
  source JSONB,
  job_type TEXT,
  company_name TEXT,
  description TEXT,
  requirements JSONB,
  benefits JSONB,
  application_url TEXT,
  location TEXT,
  department TEXT,
  date_posted TEXT,
  job_id TEXT,
  ats_type TEXT,
  scraped_at TEXT,
  source_url TEXT,
  remote_type TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create companies table
CREATE TABLE companies (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create profiles table for user actions (assuming no auth, use session_id)
CREATE TABLE profiles (
  id SERIAL PRIMARY KEY,
  session_id TEXT UNIQUE,
  saved_jobs JSONB DEFAULT '[]',
  hidden_jobs JSONB DEFAULT '[]',
  applied_jobs JSONB DEFAULT '[]',
  reported_jobs JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for fast searching
CREATE INDEX idx_jobs_title ON jobs USING GIN (to_tsvector('english', title));
CREATE INDEX idx_jobs_description ON jobs USING GIN (to_tsvector('english', description));
CREATE INDEX idx_jobs_source ON jobs USING GIN (source);
CREATE INDEX idx_jobs_job_type ON jobs (job_type);
CREATE INDEX idx_jobs_company_name ON jobs (company_name);