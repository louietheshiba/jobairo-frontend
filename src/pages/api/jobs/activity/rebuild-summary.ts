import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/utils/supabase';

// Admin endpoint: POST /api/jobs/activity/rebuild-summary
// Body: { userId: string }
// Recomputes aggregated counts from user_job_activity into user_job_activity_summary

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const { userId } = req.body || {};
    if (!userId) return res.status(400).json({ error: 'userId required' });

    // Aggregate counts from raw activity
    const { data: acts, error: actsErr } = await supabase
      .from('user_job_activity')
      .select('job_id, activity_type')
      .eq('user_id', userId)
      .limit(20000);

    if (actsErr) {
      console.error('Failed to fetch raw activities for rebuild:', actsErr);
      return res.status(500).json({ error: 'Failed to fetch activity' });
    }

    const agg: Record<string, { views: number; saves: number; applies: number }> = {};
    (acts || []).forEach((a: any) => {
      const jid = a.job_id;
      if (!jid) return;
      if (!agg[jid]) agg[jid] = { views: 0, saves: 0, applies: 0 };
      if (a.activity_type === 'view') agg[jid].views++;
      if (a.activity_type === 'save') agg[jid].saves++;
      if (a.activity_type === 'apply') agg[jid].applies++;
    });

    // Upsert summary rows
    const toUpsert = Object.keys(agg).map(jid => {
      const item = agg[jid] || { views: 0, saves: 0, applies: 0 };
      return {
        user_id: userId,
        job_id: jid,
        views: item.views,
        saves: item.saves,
        applies: item.applies,
        last_activity_at: new Date().toISOString(),
      };
    });

    // If nothing to upsert, clear any existing summaries for the user
    if (toUpsert.length === 0) {
      await supabase.from('user_job_activity_summary').delete().eq('user_id', userId);
      return res.status(200).json({ message: 'Rebuild complete (no activity), summary cleared' });
    }

    // Use upsert (on conflict user_id+job_id) if supported by Supabase/Postgres
    const { data: upsertRes, error: upsertErr } = await supabase
      .from('user_job_activity_summary')
      .upsert(toUpsert, { onConflict: 'user_id,job_id' });

    if (upsertErr) {
      console.error('Failed to upsert summaries during rebuild:', upsertErr);
      return res.status(500).json({ error: 'Failed to upsert summaries' });
    }

    return res.status(200).json({ message: 'Rebuild complete', updated: (upsertRes || []).length });
  } catch (err) {
    console.error('Rebuild summary error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
