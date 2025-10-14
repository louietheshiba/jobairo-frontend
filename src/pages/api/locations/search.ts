import type { NextApiRequest, NextApiResponse } from 'next';

type Place = {
  place_id: string;
  display_name: string;
  lat: string;
  lon: string;
  address?: { city?: string; town?: string; village?: string; state?: string; country?: string; country_code?: string };
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const q = (req.query.q as string) || '';
  if (!q || q.trim().length === 0) {
    return res.status(400).json({ error: 'Missing query parameter q' });
  }

  // Use Nominatim (OpenStreetMap) for free geocoding/autocomplete
  // Note: Nominatim usage policy requires reasonable rate limits and a proper User-Agent header.
  const endpoint = `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&limit=10&accept-language=en&q=${encodeURIComponent(
    q
  )}`;

  try {
    const response = await fetch(endpoint, {
      headers: {
        'User-Agent': 'JobAiro/1.0 (your-email@example.com)'
      }
    });

    if (!response.ok) {
      const text = await response.text();
      console.error('Nominatim error', response.status, text);
      return res.status(502).json({ error: 'Failed to fetch location data' });
    }

    const data: Place[] = await response.json();

    // Map to simplified options and prioritize US locations
    const mapped = data
      .map((p) => {
        const city = p.address?.city || p.address?.town || p.address?.village || '';
        const state = p.address?.state || '';
        const country = p.address?.country || '';
        const country_code = p.address?.country_code || '';
        const label = city ? `${city}${state ? `, ${state}` : ''}${country ? `, ${country}` : ''}` : p.display_name;
        return {
          id: p.place_id,
          label,
          city,
          state,
          country,
          country_code,
          lat: p.lat,
          lon: p.lon
        };
      })
      // Move US entries to the front
      .sort((a, b) => {
        const aUs = a.country_code === 'us' ? 0 : 1;
        const bUs = b.country_code === 'us' ? 0 : 1;
        if (aUs !== bUs) return aUs - bUs;
        return a.label.localeCompare(b.label);
      });

    return res.status(200).json({ results: mapped });
  } catch (error) {
    console.error('Locations API error', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
