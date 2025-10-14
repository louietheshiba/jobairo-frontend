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

    // Detect whether the user has any recorded activity at all
    const { data: anyActivityRows } = await supabase
      .from('user_job_activity')
      .select('id')
      .eq('user_id', userId)
      .limit(1);

    const hasActivity = Array.isArray(anyActivityRows) && anyActivityRows.length > 0;

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

    // Prepare finalJobs array (start with relevantJobs or empty)
    let finalJobs = relevantJobs || [];

    // If we don't have enough, add recent jobs (same as before)
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

      const existingIds = [...finalJobs.map(j => j.id), ...excludeIds];
      if (existingIds.length > 0) {
        fallbackQuery.not('id', 'in', `(${existingIds.join(',')})`);
      }

      const { data: fallbackJobs } = await fallbackQuery;
      if (fallbackJobs) {
        finalJobs = [...finalJobs, ...fallbackJobs].slice(0, 24);
      }
    }

    // Server-side scoring using user activity (if available)
    // Fetch activity rows for these job IDs for this user
    const jobIds = finalJobs.map(j => j.id);
    let activityRows: any[] = [];
    if (jobIds.length > 0) {
      const { data: acts, error: actsError } = await supabase
        .from('user_job_activity')
        .select('job_id, activity_type, created_at')
        .eq('user_id', userId as string)
        .in('job_id', jobIds);

      if (actsError) {
        console.warn('Error fetching user activity for scoring:', actsError);
      } else {
        activityRows = acts || [];
      }
    }

    // Build a map of counts per job
    const activityMap: Record<string, { views: number; saves: number; applies: number }> = {};
    activityRows.forEach((r: any) => {
      const id = r.job_id;
      if (!activityMap[id]) activityMap[id] = { views: 0, saves: 0, applies: 0 };
      if (r.activity_type === 'view') activityMap[id].views++;
      if (r.activity_type === 'save') activityMap[id].saves++;
      if (r.activity_type === 'apply') activityMap[id].applies++;
    });

    // Transform and score jobs
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

    // Compute score for each transformed job
    // If the user has activity, use activity-weighted scoring.
    // If the user has no activity, fall back to popularity (applicant_count) + recency.
    const scored = transformedJobs.map(job => {
      let score = 0;

      if (hasActivity) {
        const counts = activityMap[job.id] || { views: 0, saves: 0, applies: 0 };
        score += (counts.views || 0) * 1;
        score += (counts.saves || 0) * 5;
        score += (counts.applies || 0) * 10;
      } else {
        // popularity fallback: use applicant_count if available
        score += (job.applicant_count || 0) * 1;
      }

      // small recency bonus (applies in both modes)
      const postedTs = job.date_posted ? new Date(job.date_posted).getTime() : 0;
      if (postedTs) {
        const days = (Date.now() - postedTs) / (1000 * 60 * 60 * 24);
        if (days < 1) score += 5;
        else if (days < 7) score += 3;
        else if (days < 30) score += 1;
      }

      return { job, score };
    });

    scored.sort((a, b) => b.score - a.score);

    const finalTransformed = scored.map(s => s.job).slice(0, 50);

    console.log(`Returning ${finalTransformed.length} relevant jobs for user ${userId} (personalized=${hasActivity})`);

    return res.status(200).json({
      jobs: finalTransformed,
      personalized: !!hasActivity,
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