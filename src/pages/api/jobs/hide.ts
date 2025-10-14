import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/utils/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userId, jobId, reason } = req.body as { userId?: string; jobId?: string; reason?: string };

    if (!userId || !jobId) {
      return res.status(400).json({ error: 'Missing userId or jobId' });
    }

    const payload: Record<string, any> = {
      user_id: userId,
      job_id: jobId,
    };

    if (reason) payload.reason = reason;

    const { error } = await supabase.from('hidden_jobs').insert(payload);

    if (error) {
      // Unique constraint (already hidden) -> treat as success
      if ((error as any).code === '23505') {
        return res.status(200).json({ message: 'Job already hidden' });
      }

      console.error('Error hiding job:', error);
      return res.status(500).json({ error: 'Failed to hide job' });
    }

    return res.status(200).json({ message: 'Job hidden successfully' });
  } catch (err) {
    console.error('Hide job API error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}