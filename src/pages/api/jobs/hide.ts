import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/utils/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userId, jobId } = req.body;

    if (!userId || !jobId) {
      return res.status(400).json({ error: 'User ID and Job ID are required' });
    }

    console.log('Hiding job:', { userId, jobId });

    // Add to hidden_jobs table
    const { error } = await supabase
      .from('hidden_jobs')
      .insert({
        user_id: userId,
        job_id: jobId,
      });

    if (error) {
      // If the job is already hidden, that's fine
      if (error.code === '23505') { // Unique constraint violation
        return res.status(200).json({ message: 'Job already hidden' });
      }

      console.error('Error hiding job:', error);
      return res.status(500).json({ error: 'Failed to hide job' });
    }

    console.log('Job hidden successfully:', { userId, jobId });
    return res.status(200).json({ message: 'Job hidden successfully' });

  } catch (error) {
    console.error('Hide job API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}