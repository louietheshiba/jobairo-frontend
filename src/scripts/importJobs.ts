import 'dotenv/config';
import { supabase } from '../utils/supabase.js';
import fs from 'fs';
import path from 'path';

const gitlabJobs = JSON.parse(
  fs.readFileSync(path.join(process.cwd(), 'src/utils/test_dataset_cleaned_final.json'), 'utf-8')
);

async function importJobs() {
  for (const job of gitlabJobs) {
    // Clean invalid salary_range
    if (job.salary_range && typeof job.salary_range === 'string') {
      if (job.salary_range.startsWith('window.__remixContext')) {
        job.salary_range = null;
        console.log(`Set salary_range to null for job ${job.job_id}`);
      } else {
        // Extract salary range from text
        const match = job.salary_range.match(/\$\d{1,3}(?:,\d{3})* - \$\d{1,3}(?:,\d{3})*/);
        if (match) {
          job.salary_range = match[0];
          console.log(`Extracted salary_range: ${job.salary_range} for job ${job.job_id}`);
        }
      }
    }

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
      remote_type: job.work_setting || job.remote_type || null,
      salary_range: job.salary_range || null,
      application_url: job.application_url || null,
      source_url: job.source_url || null,
      ats_type: job.ats_type || null,
      external_job_id: job.job_id,
      date_posted: job.date_posted || null,
      scraped_at: job.scraped_at || new Date().toISOString(),
      status: 'open',
      experience_level: job.experience_level || null,
      job_category: job.job_category || null,
      required_skills: job.required_skills || null,
      benefits: job.benefits || null,
      visa_sponsorship: job.visa_sponsorship || null,
      equity_offered: job.equity_offered || null,
      salary: job.salary || null,
    });

    if (error) {
      console.error('Error inserting job:', error.message);
    } else {
      console.log('Inserted job:', data);
    }
  }
}

importJobs();
