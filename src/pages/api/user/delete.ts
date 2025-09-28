import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Ensure we always return JSON
  res.setHeader('Content-Type', 'application/json');

  console.log('Delete API called with method:', req.method);

  if (req.method !== 'DELETE') {
    console.log('Method not allowed:', req.method);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userId } = req.body;
    console.log('Request body:', req.body);
    console.log('UserId extracted:', userId);

    if (!userId) {
      console.log('User ID is missing from request');
      return res.status(400).json({ error: 'User ID is required' });
    }

    // Soft delete approach: mark user as deleted instead of removing from auth
    console.log('Performing soft delete for user:', userId);

    // Update users table to mark as deleted
    const { error: userUpdateError } = await supabase
      .from('users')
      .update({
        status: 'deleted',
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);

    if (userUpdateError) {
      console.error('Error updating user status:', userUpdateError);
      // Continue anyway - the logout will still work
    } else {
      console.log('User status updated to deleted');
    }

    // Clear sensitive profile data
    const { error: profileUpdateError } = await supabase
      .from('profiles')
      .update({
        phone: null,
        location: null,
        job_preferences: null,
        avatar_url: null,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId);

    if (profileUpdateError) {
      console.error('Error clearing profile data:', profileUpdateError);
      // Continue anyway
    } else {
      console.log('Profile data cleared');
    }

    console.log('Soft delete completed successfully for user:', userId);

    return res.status(200).json({
      success: true,
      message: 'Account deactivated successfully',
      note: 'Your account has been marked as inactive. Contact support to reactivate if needed.'
    });

  } catch (error) {
    console.error('Unexpected error in delete API:', error);
    return res.status(500).json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}