import type { Job } from '@/types/JobTypes';
import { supabase } from '@/utils/supabase';

const QUEUE_KEY = 'job_activity_queue_v1';
const LOCAL_STORE_KEY = 'job_activity_v1'; // keep older store as fallback

type ActivityEntry = {
  views: number;
  saves: number;
  lastViewed?: number;
  lastSaved?: number;
  categories?: Record<string, number>;
};

type QueueEvent = {
  jobId: string;
  activityType: string;
  metadata?: any;
  idempotencyKey?: string | null;
  createdAt?: number;
};

function readLocalStore(): Record<string, ActivityEntry> {
  try {
    const raw = localStorage.getItem(LOCAL_STORE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as Record<string, ActivityEntry>;
  } catch (e) {
    console.error('Failed to read job activity store', e);
    return {};
  }
}

function writeLocalStore(map: Record<string, ActivityEntry>) {
  try {
    localStorage.setItem(LOCAL_STORE_KEY, JSON.stringify(map));
  } catch (e) {
    console.error('Failed to write job activity store', e);
  }
}

function readQueue(): QueueEvent[] {
  try {
    const raw = localStorage.getItem(QUEUE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as QueueEvent[];
  } catch (e) {
    console.error('Failed to read activity queue', e);
    return [];
  }
}

function writeQueue(q: QueueEvent[]) {
  try {
    localStorage.setItem(QUEUE_KEY, JSON.stringify(q));
  } catch (e) {
    console.error('Failed to write activity queue', e);
  }
}

async function getCurrentUserId(): Promise<string | null> {
  try {
    const { data } = await supabase.auth.getSession();
    const session = data.session;
    if (session?.user?.id) return session.user.id;
    return null;
  } catch (e) {
    return null;
  }
}

async function postActivity(event: QueueEvent): Promise<boolean> {
  try {
    const userId = await getCurrentUserId();
    const payload: any = {
      jobId: event.jobId,
      activityType: event.activityType,
      metadata: event.metadata || {},
      idempotencyKey: event.idempotencyKey || null,
    };
    if (userId) payload.userId = userId;

    const res = await fetch('/api/jobs/activity', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      console.warn('postActivity failed', res.status);
      return false;
    }

    return true;
  } catch (e) {
    console.error('postActivity error', e);
    return false;
  }
}

async function flushQueue() {
  try {
    const q = readQueue();
    if (!q || q.length === 0) return;

    const remaining: QueueEvent[] = [];
    for (const ev of q) {
      const ok = await postActivity(ev);
      if (!ok) remaining.push(ev);
    }

    writeQueue(remaining);
  } catch (e) {
    console.error('flushQueue error', e);
  }
}

// Try flushing when online
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    setTimeout(() => flushQueue(), 2000);
  });
  // attempt an initial flush
  setTimeout(() => flushQueue(), 2000);
}

function queueEvent(ev: QueueEvent) {
  try {
    const q = readQueue();
    ev.createdAt = Date.now();
    q.push(ev);
    writeQueue(q);
  } catch (e) {
    console.error('queueEvent error', e);
  }
}

export async function recordView(job: Job) {
  try {
    const event: QueueEvent = { jobId: job.id, activityType: 'view', metadata: { source: 'ui' } };
    const ok = await postActivity(event);
    if (!ok) {
      // record locally for fallback analysis
      queueEvent(event);
      // also update local aggregation for immediate scoring/UI
      const map = readLocalStore();
      const id = job.id;
      const entry = map[id] || { views: 0, saves: 0, categories: {} };
      entry.views = (entry.views || 0) + 1;
      entry.lastViewed = Date.now();
      const cat = job.job_category || job.department || job.employment_type || 'unknown';
      if (!entry.categories) entry.categories = {};
      entry.categories[cat] = (entry.categories[cat] || 0) + 1;
      map[id] = entry;
      writeLocalStore(map);
    }
  } catch (e) {
    console.error('recordView error', e);
  }
}

export async function recordSave(job: Job) {
  try {
    const event: QueueEvent = { jobId: job.id, activityType: 'save', metadata: { source: 'ui' } };
    const ok = await postActivity(event);
    if (!ok) {
      queueEvent(event);
      const map = readLocalStore();
      const id = job.id;
      const entry = map[id] || { views: 0, saves: 0, categories: {} };
      entry.saves = (entry.saves || 0) + 1;
      entry.lastSaved = Date.now();
      const cat = job.job_category || job.department || job.employment_type || 'unknown';
      if (!entry.categories) entry.categories = {};
      entry.categories[cat] = (entry.categories[cat] || 0) + 2;
      map[id] = entry;
      writeLocalStore(map);
    }
  } catch (e) {
    console.error('recordSave error', e);
  }
}

export async function recordApply(job: Job) {
  try {
    const event: QueueEvent = { jobId: job.id, activityType: 'apply', metadata: { source: 'ui' } };
    const ok = await postActivity(event);
    if (!ok) {
      queueEvent(event);
      // also update local aggregation
      const map = readLocalStore();
      const id = job.id;
      const entry = map[id] || { views: 0, saves: 0, categories: {} };
      // record as apply in metadata via categories to influence local scoring
      entry.lastViewed = Date.now();
      map[id] = entry;
      writeLocalStore(map);
    }
  } catch (e) {
    console.error('recordApply error', e);
  }
}

export function getActivityForJob(jobId: string): ActivityEntry | undefined {
  const map = readLocalStore();
  return map[jobId];
}

export function scoreJob(job: Job, userTopCategories: string[] = []): number {
  const entry = getActivityForJob(job.id) || { views: 0, saves: 0, categories: {} };
  let score = 0;
  score += (entry.views || 0) * 1;
  score += (entry.saves || 0) * 5;

  const jobCat = job.job_category || job.department || job.employment_type || '';
  if (jobCat && userTopCategories.length) {
    const idx = userTopCategories.indexOf(jobCat);
    if (idx >= 0) score += Math.max(0, (userTopCategories.length - idx)) * 2;
  }

  if (entry.categories) {
    Object.keys(entry.categories).forEach(cat => {
      if (cat === jobCat) score += (entry.categories?.[cat] || 0) * 0.5;
    });
  }

  const now = Date.now();
  const posted = job.date_posted || job.created_at || '';
  if (posted) {
    const postedTs = new Date(posted).getTime();
    if (!isNaN(postedTs)) {
      const days = (now - postedTs) / (1000 * 60 * 60 * 24);
      if (days < 1) score += 5;
      else if (days < 7) score += 3;
      else if (days < 30) score += 1;
    }
  }

  return score;
}

export async function getUserTopCategories(limit = 5): Promise<string[]> {
  try {
    const userId = await getCurrentUserId();
    if (userId) {
      const res = await fetch(`/api/jobs/activity?userId=${userId}&limit=200`);
      if (res.ok) {
        const json = await res.json();
        const activities = json.activities || [];
        const agg: Record<string, number> = {};
        activities.forEach((a: any) => {
          const meta = a.metadata || {};
          const cat = meta.category || meta.job_category || a.activity_type || 'unknown';
          agg[cat] = (agg[cat] || 0) + 1;
        });
        const sorted = Object.keys(agg).sort((a, b) => (agg[b] || 0) - (agg[a] || 0));
        return sorted.slice(0, limit);
      }
    }
  } catch (e) {
    console.error('getUserTopCategories error', e);
  }

  // Fallback to local aggregation
  try {
    const map = readLocalStore();
    const agg: Record<string, number> = {};
    Object.values(map).forEach(entry => {
      if (!entry.categories) return;
      Object.entries(entry.categories).forEach(([cat, val]) => {
        agg[cat] = (agg[cat] || 0) + val;
      });
    });
    const keys = Object.keys(agg || {});
    const sorted = keys.sort((a, b) => (agg[b] || 0) - (agg[a] || 0));
    return sorted.slice(0, limit);
  } catch (e) {
    return [];
  }
}

export async function getAllActivities(): Promise<Array<{ jobId: string; entry: ActivityEntry }>> {
  try {
    const userId = await getCurrentUserId();
    if (userId) {
      const res = await fetch(`/api/jobs/activity?userId=${userId}&limit=500`);
      if (res.ok) {
        const json = await res.json();
        const arr: Array<{ jobId: string; entry: ActivityEntry }> = [];
        (json.activities || []).forEach((a: any) => {
          arr.push({ jobId: a.job_id, entry: { views: a.activity_type === 'view' ? 1 : 0, saves: a.activity_type === 'save' ? 1 : 0, lastViewed: a.activity_type === 'view' ? new Date(a.created_at).getTime() : undefined, lastSaved: a.activity_type === 'save' ? new Date(a.created_at).getTime() : undefined, categories: {} } });
        });
        return arr;
      }
    }
  } catch (e) {
    console.error('getAllActivities error', e);
  }

  // Fallback to local
  try {
    const map = readLocalStore();
    const arr: Array<{ jobId: string; entry: ActivityEntry }> = [];
    Object.keys(map).forEach(jobId => {
      const entry = map[jobId];
      if (!entry) return;
      arr.push({ jobId, entry });
    });
    arr.sort((a, b) => {
      const ta = Math.max(a.entry.lastSaved || 0, a.entry.lastViewed || 0);
      const tb = Math.max(b.entry.lastSaved || 0, b.entry.lastViewed || 0);
      return tb - ta;
    });
    return arr;
  } catch (e) {
    return [];
  }
}

export default {
  recordView,
  recordSave,
  recordApply,
  getActivityForJob,
  scoreJob,
  getUserTopCategories,
  getAllActivities,
  flushQueue,
};
