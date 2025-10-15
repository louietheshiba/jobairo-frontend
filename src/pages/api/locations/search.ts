import type { NextApiRequest, NextApiResponse } from 'next';
import * as CSC from 'country-state-city';

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

  const query = q.toLowerCase().trim();

  try {
    // First, try to find matches in the country-state-city package
    const packageResults = searchInPackage(query);

    if (packageResults.length > 0) {
      return res.status(200).json({ results: packageResults });
    }

    // Fallback to Nominatim if no results from package
    const nominatimResults = await searchNominatim(query);
    return res.status(200).json({ results: nominatimResults });

  } catch (error) {
    console.error('Locations API error', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

function searchInPackage(query: string) {
  const results: any[] = [];

  // Search countries
  const countries = CSC.getAllCountries().filter((country: any) =>
    country.name.toLowerCase().includes(query)
  );

  countries.forEach((country: any) => {
    results.push({
      id: `country-${country.isoCode}`,
      label: country.name,
      city: '',
      state: '',
      country: country.name,
      country_code: country.isoCode.toLowerCase(),
      lat: '',
      lon: ''
    });
  });

  // Search states
  const states = CSC.getAllStates().filter((state: any) =>
    state.name.toLowerCase().includes(query)
  );

  states.forEach((state: any) => {
    const country = CSC.getCountryByCode(state.countryCode);
    results.push({
      id: `state-${state.isoCode}-${state.countryCode}`,
      label: `${state.name}, ${country?.name || ''}`,
      city: '',
      state: state.name,
      country: country?.name || '',
      country_code: state.countryCode.toLowerCase(),
      lat: '',
      lon: ''
    });
  });

  // Search cities
  const cities = CSC.getAllCities().filter((city: any) =>
    city.name.toLowerCase().includes(query)
  );

  cities.forEach((city: any) => {
    const country = CSC.getCountryByCode(city.countryCode);
    const state = CSC.getStateByCodeAndCountry(city.stateCode, city.countryCode);
    const label = state ? `${city.name}, ${state.name}, ${country?.name || ''}` : `${city.name}, ${country?.name || ''}`;

    results.push({
      id: `city-${city.stateCode}-${city.countryCode}-${city.name}`,
      label,
      city: city.name,
      state: state?.name || '',
      country: country?.name || '',
      country_code: city.countryCode.toLowerCase(),
      lat: '',
      lon: ''
    });
  });

  // Sort results: countries first, then states, then cities
  return results
    .sort((a, b) => {
      const typeOrder = { country: 0, state: 1, city: 2 };
      const aType = a.id.startsWith('country-') ? 'country' : a.id.startsWith('state-') ? 'state' : 'city';
      const bType = b.id.startsWith('country-') ? 'country' : b.id.startsWith('state-') ? 'state' : 'city';

      if (typeOrder[aType] !== typeOrder[bType]) {
        return typeOrder[aType] - typeOrder[bType];
      }

      // Prioritize US results
      const aUs = a.country_code === 'us' ? 1 : 0;
      const bUs = b.country_code === 'us' ? 1 : 0;
      if (aUs !== bUs) return bUs - aUs;

      return a.label.localeCompare(b.label);
    })
    .slice(0, 10); // Limit to 10 results
}

async function searchNominatim(query: string) {
  // Use Nominatim (OpenStreetMap) for free geocoding/autocomplete
  // Note: Nominatim usage policy requires reasonable rate limits and a proper User-Agent header.
  const endpoint = `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&limit=10&accept-language=en&q=${encodeURIComponent(
    query
  )}`;

  const response = await fetch(endpoint, {
    headers: {
      'User-Agent': 'JobAiro/1.0 (your-email@example.com)'
    }
  });

  if (!response.ok) {
    const text = await response.text();
    console.error('Nominatim error', response.status, text);
    throw new Error('Failed to fetch location data');
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

  return mapped;
}
