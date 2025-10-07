export interface LocationOption {
  value: string;
  label: string;
  country: string;
  state?: string;
  city: string;
  priority: number; // Lower number = higher priority
}

// Major US cities (highest priority)
const usCities: LocationOption[] = [
  // California
  { value: 'san-francisco-ca-usa', label: 'San Francisco, CA, USA', country: 'USA', state: 'CA', city: 'San Francisco', priority: 1 },
  { value: 'los-angeles-ca-usa', label: 'Los Angeles, CA, USA', country: 'USA', state: 'CA', city: 'Los Angeles', priority: 1 },
  { value: 'san-diego-ca-usa', label: 'San Diego, CA, USA', country: 'USA', state: 'CA', city: 'San Diego', priority: 1 },
  { value: 'san-jose-ca-usa', label: 'San Jose, CA, USA', country: 'USA', state: 'CA', city: 'San Jose', priority: 1 },
  { value: 'sacramento-ca-usa', label: 'Sacramento, CA, USA', country: 'USA', state: 'CA', city: 'Sacramento', priority: 2 },

  // New York
  { value: 'new-york-ny-usa', label: 'New York, NY, USA', country: 'USA', state: 'NY', city: 'New York', priority: 1 },
  { value: 'brooklyn-ny-usa', label: 'Brooklyn, NY, USA', country: 'USA', state: 'NY', city: 'Brooklyn', priority: 2 },
  { value: 'queens-ny-usa', label: 'Queens, NY, USA', country: 'USA', state: 'NY', city: 'Queens', priority: 2 },
  { value: 'manhattan-ny-usa', label: 'Manhattan, NY, USA', country: 'USA', state: 'NY', city: 'Manhattan', priority: 2 },

  // Texas
  { value: 'houston-tx-usa', label: 'Houston, TX, USA', country: 'USA', state: 'TX', city: 'Houston', priority: 1 },
  { value: 'dallas-tx-usa', label: 'Dallas, TX, USA', country: 'USA', state: 'TX', city: 'Dallas', priority: 1 },
  { value: 'austin-tx-usa', label: 'Austin, TX, USA', country: 'USA', state: 'TX', city: 'Austin', priority: 1 },
  { value: 'san-antonio-tx-usa', label: 'San Antonio, TX, USA', country: 'USA', state: 'TX', city: 'San Antonio', priority: 1 },

  // Florida
  { value: 'miami-fl-usa', label: 'Miami, FL, USA', country: 'USA', state: 'FL', city: 'Miami', priority: 1 },
  { value: 'orlando-fl-usa', label: 'Orlando, FL, USA', country: 'USA', state: 'FL', city: 'Orlando', priority: 1 },
  { value: 'tampa-fl-usa', label: 'Tampa, FL, USA', country: 'USA', state: 'FL', city: 'Tampa', priority: 1 },
  { value: 'jacksonville-fl-usa', label: 'Jacksonville, FL, USA', country: 'USA', state: 'FL', city: 'Jacksonville', priority: 2 },

  // Illinois
  { value: 'chicago-il-usa', label: 'Chicago, IL, USA', country: 'USA', state: 'IL', city: 'Chicago', priority: 1 },

  // Washington
  { value: 'seattle-wa-usa', label: 'Seattle, WA, USA', country: 'USA', state: 'WA', city: 'Seattle', priority: 1 },

  // Colorado
  { value: 'denver-co-usa', label: 'Denver, CO, USA', country: 'USA', state: 'CO', city: 'Denver', priority: 1 },

  // Georgia
  { value: 'atlanta-ga-usa', label: 'Atlanta, GA, USA', country: 'USA', state: 'GA', city: 'Atlanta', priority: 1 },

  // Arizona
  { value: 'phoenix-az-usa', label: 'Phoenix, AZ, USA', country: 'USA', state: 'AZ', city: 'Phoenix', priority: 1 },

  // Other major US cities
  { value: 'boston-ma-usa', label: 'Boston, MA, USA', country: 'USA', state: 'MA', city: 'Boston', priority: 1 },
  { value: 'philadelphia-pa-usa', label: 'Philadelphia, PA, USA', country: 'USA', state: 'PA', city: 'Philadelphia', priority: 1 },
  { value: 'washington-dc-usa', label: 'Washington, DC, USA', country: 'USA', state: 'DC', city: 'Washington', priority: 1 },
  { value: 'las-vegas-nv-usa', label: 'Las Vegas, NV, USA', country: 'USA', state: 'NV', city: 'Las Vegas', priority: 1 },
  { value: 'portland-or-usa', label: 'Portland, OR, USA', country: 'USA', state: 'OR', city: 'Portland', priority: 1 },
  { value: 'nashville-tn-usa', label: 'Nashville, TN, USA', country: 'USA', state: 'TN', city: 'Nashville', priority: 1 },
  { value: 'salt-lake-city-ut-usa', label: 'Salt Lake City, UT, USA', country: 'USA', state: 'UT', city: 'Salt Lake City', priority: 1 },
  { value: 'raleigh-nc-usa', label: 'Raleigh, NC, USA', country: 'USA', state: 'NC', city: 'Raleigh', priority: 1 },
  { value: 'minneapolis-mn-usa', label: 'Minneapolis, MN, USA', country: 'USA', state: 'MN', city: 'Minneapolis', priority: 1 },
  { value: 'pittsburgh-pa-usa', label: 'Pittsburgh, PA, USA', country: 'USA', state: 'PA', city: 'Pittsburgh', priority: 2 },
  { value: 'cincinnati-oh-usa', label: 'Cincinnati, OH, USA', country: 'USA', state: 'OH', city: 'Cincinnati', priority: 2 },
  { value: 'st-louis-mo-usa', label: 'St. Louis, MO, USA', country: 'USA', state: 'MO', city: 'St. Louis', priority: 2 },
];

// International cities (lower priority)
const internationalCities: LocationOption[] = [
  // Canada
  { value: 'toronto-on-canada', label: 'Toronto, ON, Canada', country: 'Canada', state: 'ON', city: 'Toronto', priority: 3 },
  { value: 'vancouver-bc-canada', label: 'Vancouver, BC, Canada', country: 'Canada', state: 'BC', city: 'Vancouver', priority: 3 },
  { value: 'montreal-qc-canada', label: 'Montreal, QC, Canada', country: 'Canada', state: 'QC', city: 'Montreal', priority: 3 },

  // UK
  { value: 'london-england-uk', label: 'London, England, UK', country: 'UK', state: 'England', city: 'London', priority: 3 },
  { value: 'manchester-england-uk', label: 'Manchester, England, UK', country: 'UK', state: 'England', city: 'Manchester', priority: 4 },
  { value: 'birmingham-england-uk', label: 'Birmingham, England, UK', country: 'UK', state: 'England', city: 'Birmingham', priority: 4 },

  // Germany
  { value: 'berlin-germany', label: 'Berlin, Germany', country: 'Germany', city: 'Berlin', priority: 3 },
  { value: 'munich-germany', label: 'Munich, Germany', country: 'Germany', city: 'Munich', priority: 4 },
  { value: 'frankfurt-germany', label: 'Frankfurt, Germany', country: 'Germany', city: 'Frankfurt', priority: 4 },

  // France
  { value: 'paris-france', label: 'Paris, France', country: 'France', city: 'Paris', priority: 3 },
  { value: 'lyon-france', label: 'Lyon, France', country: 'France', city: 'Lyon', priority: 4 },

  // Australia
  { value: 'sydney-nsw-australia', label: 'Sydney, NSW, Australia', country: 'Australia', state: 'NSW', city: 'Sydney', priority: 3 },
  { value: 'melbourne-vic-australia', label: 'Melbourne, VIC, Australia', country: 'Australia', state: 'VIC', city: 'Melbourne', priority: 3 },

  // Netherlands
  { value: 'amsterdam-netherlands', label: 'Amsterdam, Netherlands', country: 'Netherlands', city: 'Amsterdam', priority: 3 },

  // Sweden
  { value: 'stockholm-sweden', label: 'Stockholm, Sweden', country: 'Sweden', city: 'Stockholm', priority: 3 },

  // Singapore
  { value: 'singapore-singapore', label: 'Singapore, Singapore', country: 'Singapore', city: 'Singapore', priority: 3 },

  // Japan
  { value: 'tokyo-japan', label: 'Tokyo, Japan', country: 'Japan', city: 'Tokyo', priority: 3 },

  // India
  { value: 'bangalore-karnataka-india', label: 'Bangalore, Karnataka, India', country: 'India', state: 'Karnataka', city: 'Bangalore', priority: 4 },
  { value: 'mumbai-maharashtra-india', label: 'Mumbai, Maharashtra, India', country: 'India', state: 'Maharashtra', city: 'Mumbai', priority: 4 },
  { value: 'delhi-india', label: 'Delhi, India', country: 'India', city: 'Delhi', priority: 4 },

  // Remote work option
  { value: 'remote', label: 'Remote', country: 'Remote', city: 'Remote', priority: 0 },
];

// Combine and sort by priority (lower number = higher priority)
export const locationOptions: LocationOption[] = [...usCities, ...internationalCities].sort((a, b) => a.priority - b.priority);

// Helper function to get location by value
export const getLocationByValue = (value: string): LocationOption | undefined => {
  return locationOptions.find(option => option.value === value);
};

// Helper function to get locations by partial match
export const searchLocations = (query: string): LocationOption[] => {
  if (!query.trim()) return locationOptions.slice(0, 50); // Return first 50 if no query

  const lowerQuery = query.toLowerCase();
  return locationOptions.filter(option =>
    option.label.toLowerCase().includes(lowerQuery) ||
    option.city.toLowerCase().includes(lowerQuery) ||
    (option.state && option.state.toLowerCase().includes(lowerQuery)) ||
    option.country.toLowerCase().includes(lowerQuery)
  ).slice(0, 50); // Limit to 50 results
};