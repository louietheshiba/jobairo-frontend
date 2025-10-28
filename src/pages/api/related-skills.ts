import type { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { query } = req.query

    if (!query || typeof query !== 'string' || !query.trim()) {
      return res.status(400).json({ error: 'Missing or invalid query parameter' })
    }

    const { data, error } = await supabase.rpc('get_related_skills', {
      query: query.trim(),
    })

    if (error) {
      console.error('Supabase RPC error:', error)
      return res.status(500).json({ error: error.message })
    }

    return res.status(200).json({ results: data })
  } catch (err: any) {
    console.error('Server error:', err)
    return res.status(500).json({ error: err.message || 'Internal server error' })
  }
}