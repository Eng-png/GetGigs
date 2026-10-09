import { useMemo, useState } from 'react';
import { Link } from 'wouter';
import { Map, Search } from 'lucide-react';
import { cities, genres, venueTypes } from '../data/constants';
import { venues } from '../data/venues';
import type { Artist, Venue } from '../types';
import { scoreVenue } from '../utils/scoring';
import { VenueCard } from '../components/VenueCard';

export function Discover({ artist, savedIds, onToggle }: { artist: Artist; savedIds: string[]; onToggle: (id: string) => void }) {
  const [query, setQuery] = useState('');
  const [genre, setGenre] = useState('All genres');
  const [city, setCity] = useState('Near me');
  const [type, setType] = useState('Any type');
  const [capacity, setCapacity] = useState('Any');
  const [minimum, setMinimum] = useState('Any match');
  const results = useMemo(() => venues.map((venue) => ({ ...venue, score: scoreVenue(venue, artist) }))
    .filter((venue) => {
      const search = `${venue.name} ${venue.city} ${venue.genres.join(' ')}`.toLowerCase();
      const local = venue.city === artist.city || (['Boston', 'Cambridge', 'Medford'].includes(venue.city) && ['Boston', 'Cambridge', 'Medford'].includes(artist.city));
      const capacityFits = capacity === 'Any' || (capacity === 'Under 150' ? venue.capacity < 150 : capacity === '150–500' ? venue.capacity >= 150 && venue.capacity <= 500 : venue.capacity >= 500);
      return (!query || search.includes(query.toLowerCase()))
        && (genre === 'All genres' || venue.genres.includes(genre))
        && (city === 'Any city' || (city === 'Near me' ? local : venue.city === city))
        && (type === 'Any type' || venue.type === type)
        && capacityFits
        && (minimum === 'Any match' || venue.score >= Number(minimum));
    }).sort((a, b) => b.score - a.score), [artist, capacity, city, genre, minimum, query, type]);
  return <main className="page-wrap fade-in">
    <div className="section-heading"><div><div className="eyebrow">Your next stage starts here</div><h1 className="page-title">Good rooms. Better fits.</h1><p className="lede">A clearer path from the music you make to the rooms that want to hear it, {artist.name}.</p></div><Link href="/matchmap" className="button primary"><Map size={16} /> Explore matchmap</Link></div>
    <div className="filters"><div className="searchbox"><Search size={17} color="#85918a" /><input aria-label="Search venues, cities or genres" data-testid="input-search-venues" placeholder="Venue, city, or sound…" value={query} onChange={(event) => setQuery(event.target.value)} /></div>
      <select className="select" aria-label="Genre filter" value={genre} onChange={(event) => setGenre(event.target.value)} data-testid="select-genre">{['All genres', ...genres].map((item) => <option key={item}>{item}</option>)}</select>
      <select className="select" aria-label="City filter" value={city} onChange={(event) => setCity(event.target.value)} data-testid="select-city">{['Near me', 'Any city', ...cities].map((item) => <option key={item}>{item}</option>)}</select>
      <select className="select" aria-label="Capacity filter" value={capacity} onChange={(event) => setCapacity(event.target.value)} data-testid="select-capacity">{['Any', 'Under 150', '150–500', '500+'].map((item) => <option key={item}>{item}</option>)}</select>
      <select className="select" aria-label="Venue type filter" value={type} onChange={(event) => setType(event.target.value)} data-testid="select-type">{['Any type', ...venueTypes].map((item) => <option key={item}>{item}</option>)}</select>
      <select className="select" aria-label="Minimum match filter" value={minimum} onChange={(event) => setMinimum(event.target.value)} data-testid="select-match">{['Any match', '70', '85', '90'].map((item) => <option key={item} value={item}>{item === 'Any match' ? item : `${item}%+ match`}</option>)}</select>
    </div>
    <div className="split-heading" style={{ marginTop: 27 }}><div><div className="eyebrow">Picked for your sound</div><h2 style={{ font: '700 22px var(--app-font-serif)', margin: '6px 0 0' }}>Strong fits around {artist.city}</h2></div><span style={{ fontSize: 12, color: '#7b8780' }}>{results.length} venues to explore</span></div>
    {results.length > 0 ? <div className="venue-grid">{results.map((venue) => <VenueCard key={venue.id} venue={venue as Venue & { score: number }} saved={savedIds.includes(venue.id)} onToggle={onToggle} />)}</div> : <div className="empty-state" style={{ marginTop: 22 }}><Search size={25} /><h3>No rooms match those filters</h3><p>Try widening your search or clearing a filter.</p><button className="button" onClick={() => { setQuery(''); setGenre('All genres'); setCity('Near me'); setType('Any type'); setCapacity('Any'); setMinimum('Any match'); }}>Clear all filters</button></div>}
  </main>;
}