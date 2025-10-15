import * as CSC from 'country-state-city';

export interface LocationOption {
  value: string;
  label: string;
  country: string;
  state?: string;
  city: string;
  priority: number; // Lower number = higher priority
}

// Generate location options from country-state-city package
const generateLocationOptions = (): LocationOption[] => {
  const options: LocationOption[] = [];

  // Get all countries
  const countries = CSC.getAllCountries();

  // Priority countries (US first, then major international)
  const priorityCountries = ['US', 'CA', 'GB', 'DE', 'FR', 'AU', 'NL', 'SE', 'SG', 'JP', 'IN'];

  countries.forEach((country: any) => {
    const countryCode = country.isoCode;
    const countryName = country.name;
    const isPriority = priorityCountries.includes(countryCode);

    // Get states for this country
    const states = CSC.getStatesOfCountry(countryCode);

    if (states.length > 0) {
      states.forEach((state: any) => {
        const stateCode = state.isoCode;
        const stateName = state.name;

        // Get cities for this state
        const cities = CSC.getCitiesOfState(countryCode, stateCode);

        cities.forEach((city: any) => {
          const cityName = city.name;
          const value = `${cityName.toLowerCase().replace(/\s+/g, '-')}-${stateCode.toLowerCase()}-${countryCode.toLowerCase()}`;
          const label = `${cityName}, ${stateName}, ${countryName}`;
          const priority = countryCode === 'US' ? 1 : isPriority ? 3 : 4;

          options.push({
            value,
            label,
            country: countryName,
            state: stateName,
            city: cityName,
            priority
          });
        });
      });
    } else {
      // Countries without states (like Singapore, Netherlands)
      const cities = CSC.getCitiesOfCountry(countryCode);
      if (cities) {
        cities.forEach((city: any) => {
          const cityName = city.name;
          const value = `${cityName.toLowerCase().replace(/\s+/g, '-')}-${countryCode.toLowerCase()}`;
          const label = `${cityName}, ${countryName}`;
          const priority = isPriority ? 3 : 4;

          options.push({
            value,
            label,
            country: countryName,
            city: cityName,
            priority
          });
        });
      }
    }
  });

  // Sort by priority and then alphabetically
  return options.sort((a, b) => {
    if (a.priority !== b.priority) return a.priority - b.priority;
    return a.label.localeCompare(b.label);
  });
};

export const locationOptions: LocationOption[] = generateLocationOptions();

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

// Helper function to get display label from database location value
export const getDisplayLabelFromLocation = (locationValue: string): string => {
  if (!locationValue) return 'Not specified';

  // First try to find exact match
  const exactMatch = locationOptions.find(option => option.value === locationValue);
  if (exactMatch) return exactMatch.label;

  // If no exact match, try to find by country name (for cases like "Japan", "US", etc.)
  const countryMatch = locationOptions.find(option =>
    option.country.toLowerCase() === locationValue.toLowerCase()
  );
  if (countryMatch) return countryMatch.label;

  // If still no match, try partial matches
  const partialMatch = locationOptions.find(option =>
    option.country.toLowerCase().includes(locationValue.toLowerCase()) ||
    option.city.toLowerCase().includes(locationValue.toLowerCase()) ||
    (option.state && option.state.toLowerCase().includes(locationValue.toLowerCase()))
  );
  if (partialMatch) return partialMatch.label;

  // If no match found, return the original value
  return locationValue;
};