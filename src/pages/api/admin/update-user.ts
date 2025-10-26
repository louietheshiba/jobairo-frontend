import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// 🧠 Use your server-only Supabase key
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! 
);

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { user_id, metadata } = req.body;

    if (!user_id) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const { error } = await supabaseAdmin.auth.admin.updateUserById(user_id, {
      user_metadata: metadata,
    });

    if (error) throw error;

    return res.status(200).json({ success: true });
  } catch (error: any) {
    console.error('Admin user update failed:', error);
    return res.status(500).json({ error: error.message });
  }
}
