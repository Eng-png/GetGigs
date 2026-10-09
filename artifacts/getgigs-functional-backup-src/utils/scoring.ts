import { scoreWeights } from '../data/constants';
import type { Artist, FitFactors, Venue } from '../types';

const nearbyCities = ['Boston', 'Cambridge', 'Medford'];
export function getEffectiveFactors(venue: Venue, artist: Artist): FitFactors {
  const genreFit = venue.genres.some((genre) => artist.genres.includes(genre))
    ? Math.min(100, venue.factors.genre)
    : Math.round(venue.factors.genre * 0.48);
  const chosenArea = artist.preferredCities.includes(venue.city);
  const local = venue.city === artist.city || (nearbyCities.includes(venue.city) && nearbyCities.includes(artist.city));
  const distanceFit = chosenArea ? 100 : local ? 96 : artist.willingToTravel ? venue.factors.location : Math.min(20, venue.factors.location);
  const range = artist.typicalAudienceSize;
  const audienceCapacityFit = range === 'Any'
    ? venue.factors.capacity
    : range === 'Under 100' ? (venue.capacity < 100 ? venue.factors.capacity : Math.min(45, venue.factors.capacity))
    : range === '100–250' ? (venue.capacity >= 80 && venue.capacity <= 350 ? venue.factors.capacity : Math.min(58, venue.factors.capacity))
    : range === '250–500' ? (venue.capacity >= 180 && venue.capacity <= 700 ? venue.factors.capacity : Math.min(58, venue.factors.capacity))
    : venue.capacity >= 400 ? venue.factors.capacity : Math.min(60, venue.factors.capacity);
  const preferredRoomFit = artist.capacity === 'Any'
    ? venue.factors.capacity
    : artist.capacity === 'Under 150' ? (venue.capacity < 150 ? venue.factors.capacity : Math.min(48, venue.factors.capacity))
    : artist.capacity === '150–500' ? (venue.capacity >= 120 && venue.capacity <= 650 ? venue.factors.capacity : Math.min(58, venue.factors.capacity))
    : venue.capacity >= 400 ? venue.factors.capacity : Math.min(58, venue.factors.capacity);
  const capacityFit = Math.round((audienceCapacityFit + preferredRoomFit) / 2);
  const preferredTypeFit = !artist.preferredVenueTypes.length || artist.preferredVenueTypes.includes(venue.type);
  const formatFits = artist.artistType === 'DJ' || artist.artistType === 'Producer'
    ? /electronic|dj|dance|club/i.test(`${venue.style} ${venue.type}`)
    : artist.artistType === 'Solo Artist'
      ? /solo|acoustic|listening|folk/i.test(`${venue.style} ${venue.type}`)
      : true;
  const styleFit = preferredTypeFit && formatFits ? venue.factors.style : Math.min(54, venue.factors.style);
  const audienceFit = artist.socialFollowers + artist.monthlyListeners > 0
    ? Math.min(100, Math.round((venue.factors.audience + Math.min(12, Math.log10(artist.monthlyListeners + artist.socialFollowers + 1) * 2)) ))
    : venue.factors.audience;
  return { genre: genreFit, location: distanceFit, audience: audienceFit, capacity: capacityFit, style: styleFit };
}
export function scoreVenue(venue: Venue, artist: Artist): number {
  const factors = getEffectiveFactors(venue, artist);
  // Weighted exactly as requested: genre 30%, location 20%, audience 20%, capacity 15%, performance style 15%.
  return Math.round(scoreWeights.reduce((total, factor) => total + factors[factor.key] * factor.weight / 100, 0));
}