import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/utils/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { userId: qUserId, timestamp } = req.body || {};
    let userId = qUserId || null;

    // Try to derive from session if not provided
    if (!userId) {
      try {
        const { data } = await supabase.auth.getSession();
        const session = (data as any)?.session;
        if (session?.user?.id) userId = session.user.id;
      } catch (e) {}
    }

    if (!userId) return res.status(400).json({ error: 'userId required' });

    // Read existing job_preferences
    const { data: profileData, error: profileErr } = await supabase
      .from('profiles')
      .select('id, job_preferences')
      .eq('user_id', userId)
      .single();

    if (profileErr && (profileErr as any).code !== 'PGRST116') {
      console.error('Error reading profile for lastFetch:', profileErr);
      // continue — we'll attempt to upsert
    }

    const existingPrefs = (profileData && profileData.job_preferences) ? profileData.job_preferences : {};
    const newPrefs = { ...existingPrefs, lastRelevantJobsFetch: timestamp || Date.now() };

    // Upsert the profile row (insert if missing)
    const { data: upsertData, error: upsertErr } = await supabase
      .from('profiles')
      .upsert({ user_id: userId, job_preferences: newPrefs }, { onConflict: 'user_id' })
      .select();

    if (upsertErr) {
      console.error('Error upserting profile lastFetch:', upsertErr);
      return res.status(500).json({ error: 'Failed to persist last fetch' });
    }

    return res.status(200).json({ message: 'Saved', data: upsertData });
  } catch (err) {
    console.error('lastFetch API error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
