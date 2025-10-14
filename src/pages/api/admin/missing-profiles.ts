import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/utils/supabase';
import { createClient } from '@supabase/supabase-js';

const supabaseService = (process.env.SUPABASE_SERVICE_ROLE_KEY && process.env.NEXT_PUBLIC_SUPABASE_URL)
  ? createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
  : null;

// GET: list user_ids referenced by user_job_activity that don't exist in profiles
// POST: { userIds: string[] } -> insert minimal profile rows via service role
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method === 'GET') {
      const qUserId = (req.query.userId as string) || null;
      if (qUserId) {
        // Check single user
        const { data: p } = await supabase.from('profiles').select('user_id').eq('user_id', qUserId).limit(1).maybeSingle();
        const missing = !p;
        return res.status(200).json({ userId: qUserId, missing });
      }

      // Fetch user_ids referenced by activity and dedupe client-side
      const { data: many, error: manyErr } = await supabase
        .from('user_job_activity')
        .select('user_id')
        .not('user_id', 'is', null)
        .limit(10000);

      if (manyErr) {
        console.error('Failed to fetch activity user_ids:', manyErr);
        return res.status(500).json({ error: 'Failed to fetch activity user ids' });
      }

      const s = new Set<string>();
      (many || []).forEach((m: any) => { if (m.user_id) s.add(m.user_id); });
      const userIds = Array.from(s);

      // Now filter those that don't exist in profiles
      const missing: string[] = [];
      for (const uid of userIds) {
        const { data: p } = await supabase.from('profiles').select('user_id').eq('user_id', uid).limit(1).maybeSingle();
        if (!p) missing.push(uid);
      }

      return res.status(200).json({ missing, count: missing.length });
    }

    if (req.method === 'POST') {
      const body = req.body || {};
      let userIds: string[] = [];
      if (body.userIds && Array.isArray(body.userIds)) userIds = body.userIds;
      else if (body.userId && typeof body.userId === 'string') userIds = [body.userId];

      if (userIds.length === 0) return res.status(400).json({ error: 'userId or userIds required' });
      if (!supabaseService) return res.status(500).json({ error: 'SUPABASE_SERVICE_ROLE_KEY not configured' });

      const rows = userIds.map((uid: string) => ({ user_id: uid }));
      const { data, error } = await supabaseService.from('profiles').upsert(rows, { onConflict: 'user_id' }).select();
      if (error) {
        console.error('Failed to insert missing profiles:', error);
        return res.status(500).json({ error: 'Failed to insert profiles' });
      }
      return res.status(200).json({ inserted: (data || []).length });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('missing-profiles admin error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
