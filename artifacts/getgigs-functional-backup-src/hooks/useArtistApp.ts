import { useEffect, useState } from 'react';
import { artistTypes, cities, genres, initialArtist, venueTypes } from '../data/constants';
import type { Artist } from '../types';

let recoveredStoredData = false;
function read<T>(key: string, fallback: T): T {
  try { const value = localStorage.getItem(key); return value === null ? fallback : JSON.parse(value) as T; }
  catch { recoveredStoredData = true; try { localStorage.removeItem(key); } catch { /* storage may be blocked */ } return fallback; }
}
function validArtist(value: unknown): Artist {
  if (!value || typeof value !== 'object' || Array.isArray(value)) { recoveredStoredData = true; return initialArtist; }
  const candidate = value as Partial<Artist>;
  if (typeof candidate.name !== 'string' || !Array.isArray(candidate.genres) || typeof candidate.city !== 'string') recoveredStoredData = true;
  const links = candidate.links && typeof candidate.links === 'object' ? candidate.links : initialArtist.links;
  const allowed = (items: unknown, options: string[], fallback: string[]) => Array.isArray(items) ? items.filter((item): item is string => typeof item === 'string' && options.includes(item)) : fallback;
  return {
    name: typeof candidate.name === 'string' ? candidate.name : initialArtist.name,
    city: typeof candidate.city === 'string' && cities.includes(candidate.city) ? candidate.city : initialArtist.city,
    genres: allowed(candidate.genres, genres, initialArtist.genres),
    preferredCities: allowed(candidate.preferredCities, cities, initialArtist.preferredCities),
    preferredVenueTypes: allowed(candidate.preferredVenueTypes, venueTypes, initialArtist.preferredVenueTypes),
    capacity: typeof candidate.capacity === 'string' ? candidate.capacity : initialArtist.capacity,
    radius: typeof candidate.radius === 'string' ? candidate.radius : initialArtist.radius,
    audience: typeof candidate.audience === 'string' ? candidate.audience : initialArtist.audience,
    style: typeof candidate.style === 'string' ? candidate.style : initialArtist.style,
    stage: typeof candidate.stage === 'string' ? candidate.stage : initialArtist.stage,
    email: typeof candidate.email === 'string' ? candidate.email : initialArtist.email,
    artistType: typeof candidate.artistType === 'string' && artistTypes.includes(candidate.artistType) ? candidate.artistType : initialArtist.artistType,
    monthlyListeners: Number.isFinite(candidate.monthlyListeners) ? Number(candidate.monthlyListeners) : initialArtist.monthlyListeners,
    socialFollowers: Number.isFinite(candidate.socialFollowers) ? Number(candidate.socialFollowers) : initialArtist.socialFollowers,
    typicalAudienceSize: typeof candidate.typicalAudienceSize === 'string' ? candidate.typicalAudienceSize : initialArtist.typicalAudienceSize,
    travelMiles: Number.isFinite(candidate.travelMiles) ? Number(candidate.travelMiles) : initialArtist.travelMiles,
    willingToTravel: typeof candidate.willingToTravel === 'boolean' ? candidate.willingToTravel : initialArtist.willingToTravel,
    links: {
      spotify: typeof links.spotify === 'string' ? links.spotify : '',
      appleMusic: typeof links.appleMusic === 'string' ? links.appleMusic : '',
      youtube: typeof links.youtube === 'string' ? links.youtube : '',
      soundcloud: typeof links.soundcloud === 'string' ? links.soundcloud : '',
      instagram: typeof links.instagram === 'string' ? links.instagram : '',
      tiktok: typeof links.tiktok === 'string' ? links.tiktok : '',
    },
  };
}
export function useArtistApp() {
  const [artist, setArtist] = useState<Artist>(() => validArtist(read<unknown>('gg-profile', initialArtist)));
  const [savedAt, setSavedAt] = useState<Record<string, number>>(() => {
    const value = read<unknown>('gg-saved', {});
    if (Array.isArray(value)) return Object.fromEntries(value.filter((id): id is string => typeof id === 'string').map((id) => [id, 0]));
    if (!value || typeof value !== 'object') { recoveredStoredData = true; return {}; }
    return Object.fromEntries(Object.entries(value).filter((entry): entry is [string, number] => typeof entry[1] === 'number'));
  });
  const storedOnboarding = read<unknown>('gg-onboarded', false);
  const [onboarded, setOnboarded] = useState(() => storedOnboarding === true);
  const [storageIssue, setStorageIssue] = useState(recoveredStoredData || (storedOnboarding !== true && storedOnboarding !== false));
  useEffect(() => {
    try {
      localStorage.setItem('gg-profile', JSON.stringify(artist));
      localStorage.setItem('gg-saved', JSON.stringify(savedAt));
      localStorage.setItem('gg-onboarded', JSON.stringify(onboarded));
    } catch { setStorageIssue(true); }
  }, [artist, savedAt, onboarded]);
  const toggleSave = (id: string) => setSavedAt((old) => {
    if (Object.prototype.hasOwnProperty.call(old, id)) { const next = { ...old }; delete next[id]; return next; }
    return { ...old, [id]: Date.now() };
  });
  return { artist, setArtist, savedIds: Object.keys(savedAt), savedAt, toggleSave, onboarded, setOnboarded, storageIssue, setStorageIssue };
}