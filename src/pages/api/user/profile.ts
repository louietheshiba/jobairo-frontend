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
      phone, 
      location, 
      job_preferences
    } = req.body;

    console.log('Profile update request:', { 
      userId, 
      full_name, 
      phone, 
      location, 
      job_preferences: job_preferences ? JSON.stringify(job_preferences, null, 2) : 'undefined'
    });

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error('SUPABASE_SERVICE_ROLE_KEY is not set');
      return res.status(500).json({ error: 'Server configuration error' });
    }

    // Update users table
    console.log('Updating users table...');
    const { error: userError, data: userData } = await supabase
      .from('users')
      .update({
        full_name,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select();

    if (userError) {
      console.error('Error updating users table:', userError);
      return res.status(500).json({ error: 'Failed to update user profile', details: userError.message });
    }
    console.log('Users table updated:', userData);

    // Check if profile exists, then update or insert
    console.log('Checking if profile exists...');
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('user_id', userId)
      .single();

    let profileResult;
    if (existingProfile) {
      // Update existing profile
      console.log('Updating existing profile...');
      const { error: updateError, data: updateData } = await supabase
        .from('profiles')
        .update({
          phone,
          location,
          job_preferences,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .select();

      if (updateError) {
        console.error('Error updating profile:', updateError);
        return res.status(500).json({ error: 'Failed to update user profile', details: updateError.message });
      }
      profileResult = updateData;
    } else {
      // Insert new profile
      console.log('Inserting new profile...');
      const { error: insertError, data: insertData } = await supabase
        .from('profiles')
        .insert({
          user_id: userId,
          phone,
          location,
          job_preferences,
          updated_at: new Date().toISOString()
        })
        .select();

      if (insertError) {
        console.error('Error inserting profile:', insertError);
        return res.status(500).json({ error: 'Failed to update user profile', details: insertError.message });
      }
      profileResult = insertData;
    }
    console.log('Profile operation completed:', profileResult);

    res.status(200).json({ message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}