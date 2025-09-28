import 'dotenv/config';
import { supabase } from '../utils/supabase.js';
import fs from 'fs';
import path from 'path';

const gitlabJobs = JSON.parse(
  fs.readFileSync(path.join(process.cwd(), 'src/utils/gitlab_jobs_complete.json'), 'utf-8')
);

async function importJobs() {
  for (const job of gitlabJobs) {
    // Step 1: Upsert company
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .upsert(
        {
          name: job.company,
          website: job.source_url || null,
          logo_url: null,
          size: null,
          industry: null,
        },
        { onConflict: 'name' }
      )
      .select('id')
      .single();

    if (companyError) {
      console.error('Error inserting company:', companyError.message);
      continue;
    }

    const companyId = company?.id;

    // Step 2: Insert job
    const { data, error } = await supabase.from('jobs').insert({
      company_id: companyId,
      title: job.job_title,
      description: job.description || job.job_title,
      location: job.location || null,
      department: job.department || null,
      employment_type: job.employment_type || null,
      remote_type: job.remote_type || null,
      salary_range: null,
      application_url: job.application_url || null,
      source_url: job.source_url || null,
      ats_type: job.ats_type || null,
      external_job_id: job.job_id,
      date_posted: job.date_posted || null,
      scraped_at: job.scraped_at || new Date().toISOString(),
      status: 'open',
    });

    if (error) {
      console.error('Error inserting job:', error.message);
    } else {
      console.log('Inserted job:', data);
    }
  }
}

importJobs();
