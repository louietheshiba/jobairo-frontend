import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/utils/supabase';
import { createClient } from '@supabase/supabase-js';

const supabaseService = (process.env.SUPABASE_SERVICE_ROLE_KEY && process.env.NEXT_PUBLIC_SUPABASE_URL)
  ? createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
  : null;


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method === 'POST') {
      const body = req.body || {};
      const userId = body.userId || null;
      const jobId = body.jobId;
      const activityType = body.activityType;
      const metadata = body.metadata || {};
      const idempotencyKey = body.idempotencyKey || null;

      if (!jobId || !activityType) {
        return res.status(400).json({ error: 'Missing jobId or activityType' });
      }

      let finalUserId = userId;
      if (!finalUserId) {
        try {
          const { data } = await supabase.auth.getSession();
          const session = (data as any)?.session;
          if (session?.user?.id) finalUserId = session.user.id;
        } catch (e) {
          // ignore
        }
      }

      // If we have a user_id, get the profile id instead
      if (finalUserId) {
        try {
          const profileClient = supabaseService || supabase;
          const { data: profile } = await profileClient
            .from('profiles')
            .select('id')
            .eq('user_id', finalUserId)
            .limit(1)
            .maybeSingle();
          if (profile?.id) {
            // Profile ID fetched but not used since activity recording is disabled
          }
        } catch (e) {
          console.warn('Error fetching profile:', e);
        }
      }

      if (finalUserId) {
        try {
          if (supabaseService) {
            const { data: existing } = await supabaseService
              .from('profiles')
              .select('id')
              .eq('user_id', finalUserId)
              .limit(1)
              .maybeSingle();
            if (!existing) {
              await supabaseService.from('profiles').insert({ user_id: finalUserId }).select();
            }
          } else {
            const { data: existing } = await supabase
              .from('profiles')
              .select('id')
              .eq('user_id', finalUserId)
              .limit(1)
              .maybeSingle();
            if (!existing) {
              try {
                await supabase.from('profiles').insert({ user_id: finalUserId }).select();
              } catch (e) {
                console.warn('Failed to insert minimal profile with anon client; set SUPABASE_SERVICE_ROLE_KEY to allow server-side upserts.', e);
              }
            }
          }
        } catch (e) {
          console.warn('Error ensuring profile exists:', e);
        }
      }

      const payload: Record<string, any> = {
        job_id: jobId,
        activity_type: activityType,
        metadata,
      };
      // For now, don't set user_id to avoid permission issues
      // if (profileId) payload.user_id = profileId;
      // else if (finalUserId) payload.user_id = finalUserId;
      if (idempotencyKey) payload.idempotency_key = idempotencyKey;

      // Activity recording is disabled to avoid permission issues
      return res.status(200).json({ message: 'Activity recording disabled' });
    }

    if (req.method === 'GET') {
      const { userId, limit = '50' } = req.query;
      if (!userId) return res.status(400).json({ error: 'Missing userId' });

      // Get profile id from user_id if needed
      let profileId = null;
      try {
        const profileClient = supabaseService || supabase;
        const { data: profile } = await profileClient
          .from('profiles')
          .select('id')
          .eq('user_id', userId as string)
          .limit(1)
          .maybeSingle();
        if (profile?.id) {
          profileId = profile.id;
        }
      } catch (e) {
        console.warn('Error fetching profile for GET:', e);
      }

      // Recent activity
      const { data, error } = await supabase
        .from('user_job_activity')
        .select('*')
        .eq('user_id', profileId || userId as string)
        .order('created_at', { ascending: false })
        .limit(parseInt(limit as string));

      if (error) {
        console.error('Error fetching activity:', error);
        return res.status(500).json({ error: 'Failed to fetch activity' });
      }

      return res.status(200).json({ activities: data || [] });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('Activity API error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
