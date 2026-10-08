import { useMemo, useState } from 'react';
import { Link } from 'wouter';
import { Bookmark, Map } from 'lucide-react';
import { venues } from '../data/venues';
import type { Artist } from '../types';
import { scoreVenue } from '../utils/scoring';
import { VenueCard } from '../components/VenueCard';

export function Saved({ artist, savedIds, savedAt, onToggle }: { artist: Artist; savedIds: string[]; savedAt: Record<string, number>; onToggle: (id: string) => void }) {
  const [sort, setSort] = useState('Match score');
  const savedVenues = useMemo(() => venues.filter((venue) => savedIds.includes(venue.id)).map((venue) => ({ ...venue, score: scoreVenue(venue, artist) })).sort((a, b) => {
    if (sort === 'Location') return a.city.localeCompare(b.city) || a.name.localeCompare(b.name);
    if (sort === 'Capacity') return a.capacity - b.capacity;
    if (sort === 'Recently saved') return (savedAt[b.id] || 0) - (savedAt[a.id] || 0);
    return b.score - a.score;
  }), [artist, savedAt, savedIds, sort]);
  return <main className="page-wrap fade-in"><div className="section-heading"><div><div className="eyebrow">Your shortlist</div><h1 className="page-title">Saved venues</h1><p className="lede">Keep the rooms you’re considering close, and turn research into your next booking email.</p></div><Link href="/matchmap" className="button primary"><Map size={16} /> Find more venues</Link></div>
    <div className="split-heading" style={{ marginTop: 28 }}><span style={{ fontSize: 13, color: '#78847d' }}>{savedVenues.length} {savedVenues.length === 1 ? 'venue' : 'venues'} saved</span><label style={{ display: 'flex', alignItems: 'center', gap: 9, fontSize: 12, color: '#65736c' }}>Sort by <select className="select" style={{ width: 160, height: 39 }} value={sort} onChange={(event) => setSort(event.target.value)} aria-label="Sort saved venues" data-testid="select-saved-sort">{['Match score', 'Location', 'Capacity', 'Recently saved'].map((item) => <option key={item}>{item}</option>)}</select></label></div>
    {savedVenues.length ? <div className="venue-grid">{savedVenues.map((venue) => <VenueCard key={venue.id} venue={venue} saved onToggle={onToggle} />)}</div> : <div className="empty-state" style={{ marginTop: 20 }}><Bookmark size={26} /><h3>Your shortlist is a blank page</h3><p>Save a venue to keep its booking details and fit score handy.</p><Link href="/matchmap" className="button primary" style={{ marginTop: 7 }}>Explore the matchmap</Link></div>}
  </main>;
}