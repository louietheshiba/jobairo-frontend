import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader('Content-Type', 'application/json');
  if (req.method !== 'DELETE') {
    console.log('Method not allowed:', req.method);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const userId = req.query.userId as string;
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }
    try {
      const { error: deleteAuthError } = await supabase.auth.admin.deleteUser(userId);
      if (deleteAuthError) {
        return res.status(500).json({ error: 'Failed to delete user account' });
      } 
    } catch (authError) {
      return res.status(500).json({ error: 'Failed to delete user account' });
    }
    // Delete all user-related data in the correct order (reverse of foreign key dependencies)

    // Delete job views
    const { error: jobViewsError } = await supabase
      .from('job_views')
      .delete()
      .eq('user_id', userId);
    if (jobViewsError) console.error('Error deleting job views:', jobViewsError);

    // Delete applied jobs
    const { error: appliedJobsError } = await supabase
      .from('applied_jobs')
      .delete()
      .eq('user_id', userId);
    if (appliedJobsError) console.error('Error deleting applied jobs:', appliedJobsError);

    // Delete hidden jobs
    const { error: hiddenJobsError } = await supabase
      .from('hidden_jobs')
      .delete()
      .eq('user_id', userId);
    if (hiddenJobsError) console.error('Error deleting hidden jobs:', hiddenJobsError);

    // Delete saved jobs
    const { error: savedJobsError } = await supabase
      .from('saved_jobs')
      .delete()
      .eq('user_id', userId);
    if (savedJobsError) console.error('Error deleting saved jobs:', savedJobsError);

    // Delete saved searches
    const { error: savedSearchesError } = await supabase
      .from('saved_searches')
      .delete()
      .eq('user_id', userId);
    if (savedSearchesError) console.error('Error deleting saved searches:', savedSearchesError);

    // Delete profile data (this will cascade delete due to foreign key)
    const { error: profileDeleteError } = await supabase
      .from('profiles')
      .delete()
      .eq('user_id', userId);

    if (profileDeleteError) {
      console.error('Error deleting profile data:', profileDeleteError);
    }

    return res.status(200).json({
      success: true,
      message: 'Account and all associated data permanently deleted successfully'
    });

  } catch (error) {
    return res.status(500).json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}