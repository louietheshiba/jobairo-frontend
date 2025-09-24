import { supabase } from './supabase';
import type { Job } from '@/types/JobTypes';

export async function searchJobs(query: string): Promise<Job[]> {
  const { data, error } = await supabase
    .from('jobs')
    .select('*')
    .or(`title.ilike.%${query}%,description.ilike.%${query}%`);

  if (error) throw error;
  return data || [];
}

export async function filterJobs(filters: any): Promise<Job[]> {
  let query = supabase.from('jobs').select('*');

  if (filters.position) {
    query = query.ilike('title', `%${filters.position}%`);
  }
  if (filters.jobType) {
    query = query.eq('job_type', filters.jobType);
  }
  // Add more filters as needed

  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

export async function getJob(id: number): Promise<Job | null> {
  const { data, error } = await supabase
    .from('jobs')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
}

export function saveJob(jobId: number) {
  const saved = JSON.parse(localStorage.getItem('savedJobs') || '[]');
  if (!saved.includes(jobId)) {
    saved.push(jobId);
    localStorage.setItem('savedJobs', JSON.stringify(saved));
  }
}

export function hideJob(jobId: number) {
  const hidden = JSON.parse(localStorage.getItem('hiddenJobs') || '[]');
  if (!hidden.includes(jobId)) {
    hidden.push(jobId);
    localStorage.setItem('hiddenJobs', JSON.stringify(hidden));
  }
}

export function applyToJob(jobId: number) {
  const applied = JSON.parse(localStorage.getItem('appliedJobs') || '[]');
  if (!applied.includes(jobId)) {
    applied.push(jobId);
    localStorage.setItem('appliedJobs', JSON.stringify(applied));
  }
}

export function reportJob(jobId: number) {
  const reported = JSON.parse(localStorage.getItem('reportedJobs') || '[]');
  if (!reported.includes(jobId)) {
    reported.push(jobId);
    localStorage.setItem('reportedJobs', JSON.stringify(reported));
  }
}

export async function getAllJobs(): Promise<Job[]> {
  const { data, error } = await supabase
    .from('jobs')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}