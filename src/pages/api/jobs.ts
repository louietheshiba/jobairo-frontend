import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/utils/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const {
      location,
      job_type,
      company_name,
      search,
      work_setting,
      limit = '10000',
      offset = '0'
    } = req.query;

    console.log('Fetching jobs with filters:', {
      location, job_type,
      company_name, search, work_setting, limit, offset
    });

    // First get total count without filters for pagination
    let countQuery = supabase
      .from('jobs')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'open');

    // Apply filters to count query
    if (location && location !== 'all') {
      countQuery = countQuery.ilike('location', `%${location}%`);
    }

    if (company_name && company_name !== 'all') {
      countQuery = countQuery.eq('company_name', company_name);
    }

    if (job_type && job_type !== 'all') {
      countQuery = countQuery.ilike('employment_type', `%${job_type}%`);
    }

    if (work_setting && work_setting !== 'All Jobs') {
      countQuery = countQuery.ilike('remote_type', `%${work_setting}%`);
    }

    if (search) {
      countQuery = countQuery.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
    }

    const { count } = await countQuery;

    // Now get the actual data with filters and pagination
    let query = supabase
      .from('jobs')
      .select(`
        *,
        company:companies(*)
      `)
      .eq('status', 'open')
      .order('date_posted', { ascending: false })
      .range(parseInt(offset as string), parseInt(offset as string) + parseInt(limit as string) - 1);

    // Apply filters
    if (location && location !== 'all') {
      query = query.ilike('location', `%${location}%`);
    }
    if (company_name && company_name !== 'all') {
      query = query.eq('company_name', company_name);
    }

    if (job_type && job_type !== 'all') {
      query = query.ilike('employment_type', `%${job_type}%`);
    }

    if (work_setting && work_setting !== 'All Jobs') {
      query = query.ilike('remote_type', `%${work_setting}%`);
    }

    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
    }

    const { data: jobs, error } = await query;

    if (error) {
      console.error('Error fetching jobs:', error);
      return res.status(500).json({ error: 'Failed to fetch jobs' });
    }
    return res.status(200).json({
      jobs: jobs || [],
      total: count || 0,
      limit: parseInt(limit as string),
      offset: parseInt(offset as string)
    });

  } catch (error) {
    console.error('Jobs API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}