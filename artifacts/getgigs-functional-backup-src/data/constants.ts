import type { Artist } from '../types';

export const cities = ['Boston', 'Cambridge', 'Medford', 'New York', 'Los Angeles', 'Nashville', 'Chicago', 'Austin', 'Washington, DC'];
export const genres = ['Indie rock', 'Indie pop', 'Alternative', 'Folk', 'R&B', 'Soul', 'Jazz', 'Electronic', 'Hip-hop', 'Pop', 'Punk', 'Singer-songwriter'];
export const artistTypes = ['Solo Artist', 'Band', 'DJ', 'Producer', 'Other'];
export const venueTypes = ['Concert hall', 'Listening room', 'Club', 'Theatre', 'Bar / pub'];
export const scoreWeights = [
  { key: 'genre', label: 'Genre fit', weight: 30 },
  { key: 'location', label: 'Location', weight: 20 },
  { key: 'audience', label: 'Audience', weight: 20 },
  { key: 'capacity', label: 'Capacity', weight: 15 },
  { key: 'style', label: 'Performance style', weight: 15 },
] as const;
export const initialArtist: Artist = {
  name: 'Eng', city: 'Boston', genres: ['Indie rock', 'Indie pop', 'Alternative'], capacity: '150–500',
  radius: '50 miles', audience: 'Local indie listeners', style: 'Full band', stage: 'Emerging',
  email: 'eng.music@example.com', artistType: 'Band', monthlyListeners: 2400, socialFollowers: 1800,
  typicalAudienceSize: '100–250', preferredCities: ['Boston', 'Cambridge'], preferredVenueTypes: ['Club', 'Listening room', 'Concert hall'],
  willingToTravel: true, travelMiles: 50,
  links: { spotify: '', appleMusic: '', youtube: '', soundcloud: '', instagram: '', tiktok: '' },
};