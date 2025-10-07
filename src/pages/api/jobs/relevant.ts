import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/utils/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    // Get user profile with job preferences
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('job_preferences')
      .eq('user_id', userId)
      .single();

    if (profileError) {
      console.error('Error fetching user profile:', profileError);
      return res.status(500).json({ error: 'Failed to fetch user profile' });
    }

    const preferences = profile?.job_preferences || {};
    const {
      preferred_locations = [],
      desired_salary_min,
      desired_salary_max,
      job_types = []
    } = preferences;

    console.log('User preferences for relevant jobs:', {
      preferred_locations,
      desired_salary_min,
      desired_salary_max,
      job_types,
      userId
    });

    // Debug: Check what jobs exist in the database
    const { data: sampleJobs, error: sampleError } = await supabase
      .from('jobs')
      .select('id, title, location, employment_type, salary_range')
      .eq('status', 'open')
      .limit(5);

    console.log('Sample jobs in database:', sampleJobs);
    console.log('Sample jobs error:', sampleError);



    // Get user's applied jobs to avoid showing already applied positions
    const { data: appliedJobs } = await supabase
      .from('applied_jobs')
      .select('job_id')
      .eq('user_id', userId);

    const appliedJobIds = appliedJobs?.map(aj => aj.job_id) || [];

    // Get user's hidden jobs to exclude them
    const { data: hiddenJobs } = await supabase
      .from('hidden_jobs')
      .select('job_id')
      .eq('user_id', userId);

    const hiddenJobIds = hiddenJobs?.map(hj => hj.job_id) || [];

    // Build the query for relevant jobs
    let query = supabase
      .from('jobs')
      .select(`
        *,
        company:companies(*)
      `)
      .eq('status', 'open')
      .order('date_posted', { ascending: false })
      .limit(20);

    // Exclude jobs user has already applied to or hidden
    const excludeIds = [...appliedJobIds, ...hiddenJobIds];
    if (excludeIds.length > 0) {
      query = query.not('id', 'in', `(${excludeIds.join(',')})`);
    }

    // Apply location filter if user has preferred locations
    if (preferred_locations.length > 0) {
      // Create location conditions - check if any preferred location matches
      const locationConditions = preferred_locations.map((location: string) => {
        // If location is a value from our autocomplete (e.g., 'san-francisco-ca-usa'),
        // we need to extract the city name for matching
        const locationParts = location.split('-');
        if (locationParts.length >= 3) {
          // For format like 'san-francisco-ca-usa', extract city and state
          const city = locationParts.slice(0, -2).join(' ').replace(/-/g, ' ');
          const state = locationParts[locationParts.length - 2]?.toUpperCase() || '';
          // Try multiple matching patterns
          return `(location.ilike.%${city}%,location.ilike.%${city}, ${state}%,location.ilike.%${state}%)`;
        } else if (locationParts.length >= 2) {
          // For format like 'london-uk'
          const city = locationParts[0]?.replace(/-/g, ' ') || '';
          const country = locationParts[1]?.toUpperCase() || '';
          return `(location.ilike.%${city}%,location.ilike.%${country}%)`;
        }
        return `location.ilike.%${location}%`;
      });

      query = query.or(locationConditions.join(','));
    }

    // Apply job type filter if user has preferred job types
    if (job_types.length > 0) {
      // Transform job types to match database format (e.g., "Full-time" -> "full-time")
      const transformedJobTypes = job_types.map((type: string) =>
        type.toLowerCase().replace(/\s+/g, '-')
      );
      query = query.in('employment_type', transformedJobTypes);
    }

    // Apply salary range filter if specified
    // Note: This is a simplified filter since salary_range is stored as text
    // In a production system, you'd want to normalize salary data
    if (desired_salary_min || desired_salary_max) {
      let salaryConditions = [];

      if (desired_salary_min) {
        // Look for salaries that are at or above the minimum
        // This is approximate since we're dealing with text fields
        salaryConditions.push(`salary_range.ilike.%${desired_salary_min}%`);
        salaryConditions.push(`salary_range.ilike.%${Math.floor(desired_salary_min / 1000)}K%`);
      }

      if (desired_salary_max) {
        // Look for salaries that are at or below the maximum
        salaryConditions.push(`salary_range.ilike.%${desired_salary_max}%`);
        salaryConditions.push(`salary_range.ilike.%${Math.floor(desired_salary_max / 1000)}K%`);
      }

      if (salaryConditions.length > 0) {
        query = query.or(salaryConditions.join(','));
      }
    }

    console.log('Query built with filters applied');

    const { data: relevantJobs, error: jobsError } = await query;

    if (jobsError) {
      console.error('Error fetching relevant jobs:', jobsError);
      return res.status(500).json({ error: 'Failed to fetch relevant jobs' });
    }

    console.log(`Found ${relevantJobs?.length || 0} relevant jobs matching user preferences`);
    if (relevantJobs && relevantJobs.length > 0) {
      console.log('Sample relevant jobs:', relevantJobs.slice(0, 2).map(job => ({
        id: job.id,
        title: job.title,
        location: job.location,
        employment_type: job.employment_type,
        salary_range: job.salary_range
      })));
    }

    // If we don't have enough jobs based on preferences, get some recent jobs as fallback
    let finalJobs = relevantJobs || [];

    if (finalJobs.length < 6) {
      console.log('Not enough preference-based jobs, adding recent jobs as fallback');

      const fallbackQuery = supabase
        .from('jobs')
        .select(`
          *,
          company:companies(*)
        `)
        .eq('status', 'open')
        .order('date_posted', { ascending: false })
        .limit(12);

      // Exclude already fetched jobs and user's applied/hidden jobs
      const existingIds = [...finalJobs.map(j => j.id), ...excludeIds];
      if (existingIds.length > 0) {
        fallbackQuery.not('id', 'in', `(${existingIds.join(',')})`);
      }

      const { data: fallbackJobs } = await fallbackQuery;
      if (fallbackJobs) {
        finalJobs = [...finalJobs, ...fallbackJobs].slice(0, 12);
      }
    }

    // Transform jobs to match the expected format
    const transformedJobs = finalJobs.map(job => ({
      id: job.id,
      title: job.title,
      salary_range: job.salary_range || '',
      remote_type: job.remote_type || 'Not specified',
      employment_type: job.job_type || 'Not specified',
      department: job.department || '',
      location: job.location || '',
      description: job.description || '',
      company: job.company ? {
        id: job.company.id,
        name: job.company.name,
        logo_url: job.company.logo_url,
        website: job.company.website,
        industry: job.company.industry,
        size: job.company.size
      } : null,
      created_at: job.date_posted,
      application_url: job.application_url,
      requirements: job.requirements || [],
      benefits: job.benefits || [],
      tags: job.tags || [],
      status: job.status,
      date_posted: job.date_posted,
      applicant_count: job.applicant_count || 0
    }));

    console.log(`Returning ${transformedJobs.length} relevant jobs for user ${userId}`);

    return res.status(200).json({
      jobs: transformedJobs,
      preferences: {
        preferred_locations,
        desired_salary_min,
        desired_salary_max,
        job_types
      }
    });

  } catch (error) {
    console.error('Relevant jobs API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}