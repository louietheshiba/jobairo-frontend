import { supabase } from '@/utils/supabase';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  try {
    const { 
      userId, 
      full_name, 
    } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }
    const { error: profileError, } = await supabase
      .from('profiles')
      .update({
        full_name,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .select();

    if (profileError) {
      return res.status(500).json({ error: 'Failed to update user profile', details: profileError.message });
    }
    res.status(200).json({ message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}