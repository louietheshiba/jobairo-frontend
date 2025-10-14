import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/utils/supabase';

type SummaryResponse = {
  counts: { views: number; saves: number; applies: number; hidden: number };
  topJobs: Array<{ jobId: string; title?: string; score: number; views: number; saves: number; applies: number }>;
  topCategories: Array<{ category: string; score: number; views: number; saves: number; applies: number }>;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { userId: qUserId } = req.query;
    let userId = (qUserId as string) || null;

    if (!userId) {
      // try to derive from session if available
      try {
        const { data } = await supabase.auth.getSession();
        const session = (data as any)?.session;
        if (session?.user?.id) userId = session.user.id;
      } catch (e) {
        // ignore
      }
    }

    if (!userId) return res.status(400).json({ error: 'userId required' });

    // Prefer reading from a denormalized summary table (if available) for performance.
    // Fallback to scanning the raw activity table if summary isn't present.
    let activities: any[] = [];
    try {
      const { data: summaryRows } = await supabase
        .from('user_job_activity_summary')
        .select('job_id, views, saves, applies, last_activity_at')
        .eq('user_id', userId)
        .order('last_activity_at', { ascending: false })
        .limit(2000);

      if (summaryRows && summaryRows.length > 0) {
        // Expand summary rows into activity-like entries for compatibility with existing logic
        activities = summaryRows.map((s: any) => {
          const arr: any[] = [];
          for (let i = 0; i < (s.views || 0); i++) arr.push({ job_id: s.job_id, activity_type: 'view', created_at: s.last_activity_at, metadata: {} });
          for (let i = 0; i < (s.saves || 0); i++) arr.push({ job_id: s.job_id, activity_type: 'save', created_at: s.last_activity_at, metadata: {} });
          for (let i = 0; i < (s.applies || 0); i++) arr.push({ job_id: s.job_id, activity_type: 'apply', created_at: s.last_activity_at, metadata: {} });
          return arr;
        }).flat();
      } else {
        // Fallback to raw activity table
        const { data: rawActs, error: actsErr } = await supabase
          .from('user_job_activity')
          .select('job_id, activity_type, metadata, created_at')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(2000);

        if (actsErr) {
          console.error('Error fetching activities for summary:', actsErr);
          return res.status(500).json({ error: 'Failed to fetch activity' });
        }

        activities = rawActs || [];
      }
    } catch (e) {
      // If the summary table doesn't exist or the query fails, fallback to raw activity table.
      const { data: rawActs, error: actsErr } = await supabase
        .from('user_job_activity')
        .select('job_id, activity_type, metadata, created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(2000);

      if (actsErr) {
        console.error('Error fetching activities for summary fallback:', actsErr);
        return res.status(500).json({ error: 'Failed to fetch activity' });
      }

      activities = rawActs || [];
    }

    

    const counts = { views: 0, saves: 0, applies: 0, hidden: 0 };
    const jobAgg: Record<string, { views: number; saves: number; applies: number }> = {};
    const categoryAgg: Record<string, { views: number; saves: number; applies: number }> = {};

    // Collect job_ids to later fetch titles and categories
    const jobIdsSet = new Set<string>();
    (activities || []).forEach((a: any) => {
      const t = a.activity_type;
      if (t === 'view') counts.views++;
      if (t === 'save') counts.saves++;
      if (t === 'apply') counts.applies++;
      if (t === 'hide' || t === 'not_interested') counts.hidden++;

      const jid = a.job_id;
      if (!jid) return;
      jobIdsSet.add(jid);
      if (!jobAgg[jid]) jobAgg[jid] = { views: 0, saves: 0, applies: 0 };
      if (t === 'view') jobAgg[jid].views++;
      if (t === 'save') jobAgg[jid].saves++;
      if (t === 'apply') jobAgg[jid].applies++;
    });

    const jobIds = Array.from(jobIdsSet).slice(0, 200);

    // Fetch job titles and categories for the jobIds
    let jobsMap: Record<string, any> = {};
    if (jobIds.length > 0) {
      const { data: jobsData, error: jobsErr } = await supabase
        .from('jobs')
        .select('id, title, job_category, department')
        .in('id', jobIds);

      if (jobsErr) {
        console.warn('Failed to fetch job metadata for summary:', jobsErr);
      } else {
        (jobsData || []).forEach((j: any) => {
          jobsMap[j.id] = j;
        });
      }
    }

    // Build topJobs array
    const topJobsArr: Array<{ jobId: string; title?: string; score: number; views: number; saves: number; applies: number }> = [];
    Object.keys(jobAgg).forEach(jid => {
      const agg = jobAgg[jid] || { views: 0, saves: 0, applies: 0 };
      const score = (agg.views || 0) * 1 + (agg.saves || 0) * 5 + (agg.applies || 0) * 10;
      topJobsArr.push({ jobId: jid, title: jobsMap[jid]?.title, score, views: agg.views || 0, saves: agg.saves || 0, applies: agg.applies || 0 });

      // category aggregation
      const jobMeta = jobsMap[jid];
      const cat = jobMeta?.job_category || jobMeta?.department || 'unknown';
      if (!categoryAgg[cat]) categoryAgg[cat] = { views: 0, saves: 0, applies: 0 };
      categoryAgg[cat].views += agg.views || 0;
      categoryAgg[cat].saves += agg.saves || 0;
      categoryAgg[cat].applies += agg.applies || 0;
    });

    topJobsArr.sort((a, b) => b.score - a.score);

    const topCategoriesArr = Object.keys(categoryAgg).map(cat => {
      const c = categoryAgg[cat] || { views: 0, saves: 0, applies: 0 };
      const score = (c.views || 0) * 1 + (c.saves || 0) * 5 + (c.applies || 0) * 10;
      return { category: cat, score, views: c.views || 0, saves: c.saves || 0, applies: c.applies || 0 };
    }).sort((a, b) => b.score - a.score).slice(0, 10);

    const response: SummaryResponse = {
      counts,
      topJobs: topJobsArr.slice(0, 10),
      topCategories: topCategoriesArr,
    };

    return res.status(200).json(response);
  } catch (err) {
    console.error('Activity summary error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
