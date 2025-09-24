import 'dotenv/config'; 
import { supabase } from '../utils/supabase.js';
import fs from 'fs';
import path from 'path';

const gitlabJobs = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'src/utils/gitlab_jobs_complete.json'), 'utf-8'));

async function importJobs() {
  for (const job of gitlabJobs) {
    const { data, error } = await supabase
      .from('jobs')
      .insert({
        title: job.job_title,
        salary: '', // No salary info in GitLab data
        source: [job.location, job.remote_type, job.scraped_at],
        job_type: job.employment_type,
        company_name: job.company,
        description: job.description || job.job_title, // Use title if description empty
        requirements: [], // No requirements in data
        benefits: [], // No benefits in data
        application_url: job.application_url,
        location: job.location,
        department: job.department,
        date_posted: job.date_posted,
        job_id: job.job_id,
        ats_type: job.ats_type,
        scraped_at: job.scraped_at,
        source_url: job.source_url,
        remote_type: job.remote_type,
      });

    if (error) {
      console.error('Error inserting job:', error);
    } else {
      console.log('Inserted job:', data);
    }
  }
}

importJobs();