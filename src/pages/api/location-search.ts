import type { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { query } = req.query

  if (!query || typeof query !== 'string' || query.trim().length < 2) {
    return res.status(200).json({ results: [] })
  }

  const { data, error } = await supabase
    .from('cities')
    .select('city, country, admin_name, iso2, population')
    .ilike('city', `%${query}%`)
    .order('country', { ascending: false })
    .limit(15)

  if (error) {
    console.error(error)
    return res.status(500).json({ error: error.message })
  }

  // Prioritize US cities first
  const sorted = data.sort((a, b) => {
    if (a.country === 'United States' && b.country !== 'United States') return -1
    if (b.country === 'United States' && a.country !== 'United States') return 1
    return b.population - a.population
  })

  return res.status(200).json({ results: sorted })
}
