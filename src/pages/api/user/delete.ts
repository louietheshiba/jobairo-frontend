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
    const userId = req.query.userId as string;
    console.log('UserId from query:', userId);

    if (!userId) {
      console.log('User ID is missing from request');
      return res.status(400).json({ error: 'User ID is required' });
    }

    // Permanent delete: remove user from auth and clear data
    console.log('Performing permanent delete for user:', userId);

    // Delete the user from Supabase Auth
    try {
      const { error: deleteAuthError } = await supabase.auth.admin.deleteUser(userId);

      if (deleteAuthError) {
        console.error('Error deleting user from auth:', deleteAuthError);
        return res.status(500).json({ error: 'Failed to delete user account' });
      } else {
        console.log('User deleted from auth successfully');
      }
    } catch (authError) {
      console.error('Exception deleting user from auth:', authError);
      return res.status(500).json({ error: 'Failed to delete user account' });
    }

    // Clear profile data (cascade delete should handle this, but ensure)
    const { error: profileDeleteError } = await supabase
      .from('profiles')
      .delete()
      .eq('user_id', userId);

    if (profileDeleteError) {
      console.error('Error deleting profile data:', profileDeleteError);
      // Continue anyway as user is deleted
    } else {
      console.log('Profile data deleted');
    }

    // Clear users table entry if exists
    const { error: userDeleteError } = await supabase
      .from('users')
      .delete()
      .eq('id', userId);

    if (userDeleteError) {
      console.error('Error deleting user record:', userDeleteError);
      // Continue anyway
    } else {
      console.log('User record deleted');
    }

    console.log('Permanent delete completed successfully for user:', userId);

    return res.status(200).json({
      success: true,
      message: 'Account permanently deleted successfully'
    });

  } catch (error) {
    console.error('Unexpected error in delete API:', error);
    return res.status(500).json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}