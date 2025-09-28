import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/utils/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const {
      location,
      employment_type,
      remote_type,
      salary_range,
      company_size,
      limit = '20',
      offset = '0'
    } = req.query;

    console.log('Fetching jobs with filters:', {
      location, employment_type, remote_type, salary_range, company_size, limit, offset
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

    if (employment_type && employment_type !== 'all') {
      countQuery = countQuery.eq('employment_type', employment_type);
    }

    if (remote_type && remote_type !== 'all') {
      countQuery = countQuery.eq('remote_type', remote_type);
    }

    if (company_size && company_size !== 'all') {
      countQuery = countQuery.eq('company.size', company_size);
    }

    if (salary_range) {
      countQuery = countQuery.ilike('salary_range', `%${salary_range}%`);
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

    if (employment_type && employment_type !== 'all') {
      query = query.eq('employment_type', employment_type);
    }

    if (remote_type && remote_type !== 'all') {
      query = query.eq('remote_type', remote_type);
    }

    if (company_size && company_size !== 'all') {
      query = query.eq('company.size', company_size);
    }

    // Salary range filtering (basic implementation)
    if (salary_range) {
      // This is a simplified implementation - you might want to parse salary ranges more intelligently
      query = query.ilike('salary_range', `%${salary_range}%`);
    }

    const { data: jobs, error } = await query;

    if (error) {
      console.error('Error fetching jobs:', error);
      return res.status(500).json({ error: 'Failed to fetch jobs' });
    }

    console.log(`Fetched ${jobs?.length || 0} jobs`);

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