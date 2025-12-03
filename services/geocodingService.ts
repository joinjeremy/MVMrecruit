import { Candidate } from '../types';

const GEOCODE_CACHE_KEY = 'mvm_geocode_cache';
const CACHE_EXPIRATION_MS = 7 * 24 * 60 * 60 * 1000; // 1 week

interface CacheEntry {
  coords: { lat: number; lng: number };
  timestamp: number;
}

const getCache = (): Record<string, CacheEntry> => {
  try {
    const cached = localStorage.getItem(GEOCODE_CACHE_KEY);
    return cached ? JSON.parse(cached) : {};
  } catch (e) {
    return {};
  }
};

const setCache = (cache: Record<string, CacheEntry>) => {
  try {
    localStorage.setItem(GEOCODE_CACHE_KEY, JSON.stringify(cache));
  } catch (e) {
    console.error("Failed to write to geocode cache", e);
  }
};

export const getCoordinates = async (candidate: Candidate): Promise<{ lat: number; lng: number } | null> => {
  if (candidate.lat && candidate.lng) {
    return { lat: candidate.lat, lng: candidate.lng };
  }

  const locationQuery = candidate.location.toLowerCase().trim();
  if (!locationQuery) return null;

  const cache = getCache();
  const cachedEntry = cache[locationQuery];

  if (cachedEntry && Date.now() - cachedEntry.timestamp < CACHE_EXPIRATION_MS) {
    return cachedEntry.coords;
  }

  try {
    const response = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(locationQuery)}&format=json&limit=1&countrycodes=gb`);
    if (!response.ok) throw new Error('Network response was not ok.');
    
    const data = await response.json();
    if (data && data.length > 0) {
      const { lat, lon } = data[0];
      const coords = { lat: parseFloat(lat), lng: parseFloat(lon) };
      
      cache[locationQuery] = { coords, timestamp: Date.now() };
      setCache(cache);
      
      return coords;
    }
    return null;
  } catch (error) {
    console.error(`Geocoding failed for "${locationQuery}":`, error);
    return null;
  }
};