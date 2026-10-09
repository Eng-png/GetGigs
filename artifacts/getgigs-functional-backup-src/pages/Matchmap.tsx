import { useMemo, useState } from 'react';
import { Link } from 'wouter';
import { ArrowLeft, Heart, LocateFixed, MapPin, Minus, Plus, Search, ChevronRight } from 'lucide-react';
import { cities } from '../data/constants';
import { venues } from '../data/venues';
import type { Artist } from '../types';
import { scoreVenue } from '../utils/scoring';

export function Matchmap({ artist, savedIds, onToggle }: { artist: Artist; savedIds: string[]; onToggle: (id: string) => void }) {
  const [selected, setSelected] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [city, setCity] = useState('Boston');
  const [filter, setFilter] = useState('All venues');
  const [zoom, setZoom] = useState(1);
  const result = useMemo(() => venues.filter((venue) => {
    const matchesSearch = `${venue.name} ${venue.city} ${venue.genres.join(' ')}`.toLowerCase().includes(query.toLowerCase());
    const matchesCity = city === 'All cities' || venue.city === city || (city === 'Boston' && ['Cambridge', 'Medford'].includes(venue.city));
    const matchesFilter = filter === 'All venues' || (filter === 'Saved' && savedIds.includes(venue.id)) || (filter === '85%+ match' && scoreVenue(venue, artist) >= 85);
    return matchesSearch && matchesCity && matchesFilter;
  }), [artist, city, filter, query, savedIds]);
  const selectedVenue = result.find((venue) => venue.id === selected);
  const center = result.length ? [result[0].lat, result[0].lng] : [42.37, -71.1];
  const mapPoints = result.map((venue) => {
    const dx = (venue.lng - center[1]) * (Math.abs(center[1]) < 80 ? 10 : 2);
    const dy = (center[0] - venue.lat) * 10;
    return { ...venue, x: Math.max(9, Math.min(91, 50 + dx)), y: Math.max(12, Math.min(84, 48 + dy)) };
  });
  return <main className="page-wrap fade-in"><div className="section-heading"><div><div className="eyebrow">A local scene, made legible</div><h1 className="page-title">Matchmap</h1><p className="lede">See where your strongest opportunities are, then find out why they fit.</p></div><Link href="/" className="button"><ArrowLeft size={15} /> Back to discover</Link></div>
    <div className="filters"><div className="searchbox"><Search size={16} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search venue, genre or city" aria-label="Search map venues" data-testid="input-matchmap-search" /></div><select value={city} onChange={(event) => { setCity(event.target.value); setSelected(null); }} className="select" aria-label="Map city" data-testid="select-map-city">{[...cities, 'All cities'].map((item) => <option key={item}>{item}</option>)}</select><select value={filter} onChange={(event) => setFilter(event.target.value)} className="select" aria-label="Map venue filter"><option>All venues</option><option>Saved</option><option>85%+ match</option></select><span style={{ fontSize: 12, color: '#7b8780', alignSelf: 'center' }}>{result.length} matches</span></div>
    <div className="map-layout"><section className="map-list" aria-label="Matching venues">{result.length ? result.map((venue) => <button type="button" key={venue.id} className={`map-card ${selected === venue.id ? 'selected' : ''}`} onClick={() => setSelected(venue.id)} data-testid={`map-list-${venue.id}`}><img src={venue.image} alt="" /><div><div style={{ display: 'flex', justifyContent: 'space-between', gap: 4 }}><h3>{venue.name}</h3><span style={{ color: '#287557', fontWeight: 800, fontSize: 12 }}>{scoreVenue(venue, artist)}%</span></div><p>{venue.city}, {venue.state} · {venue.capacity} cap</p><div className="tag-row">{venue.genres.slice(0, 2).map((item) => <span className="tag" key={item}>{item}</span>)}</div></div></button>) : <div className="empty-state"><MapPin size={25} /><h3>Nothing in this area yet</h3><p>Try another city or clear your search.</p></div>}</section>
      <div className="map-canvas" aria-label={`Illustrated coordinates map centered on ${city}`} data-testid="map-illustration"><div className="map-grid" style={{ transform: `scale(${zoom})` }} /><div className="waterway" /><span className="map-label" style={{ left: '29%', top: '24%' }}>{city === 'Boston' ? 'CAMBRIDGE' : city.toUpperCase()}</span><span className="map-label" style={{ left: '56%', top: '65%' }}>{city === 'Boston' ? 'BOSTON' : 'VENUE DISTRICT'}</span><span className="map-label" style={{ left: '17%', top: '74%' }}>{city === 'Boston' ? 'ALLSTON' : 'LOCAL SCENE'}</span>
        {mapPoints.map((venue) => <button type="button" key={venue.id} className={`map-pin ${selected === venue.id ? 'active' : ''}`} style={{ left: `${venue.x}%`, top: `${venue.y}%` }} onClick={() => setSelected(venue.id)} aria-label={`Show ${venue.name}, ${scoreVenue(venue, artist)} percent match`} data-testid={`map-marker-${venue.id}`}>{scoreVenue(venue, artist)}%</button>)}
        <div className="map-controls"><button className="map-control" onClick={() => setZoom(Math.min(1.45, zoom + .1))} aria-label="Zoom in"><Plus size={17} /></button><button className="map-control" onClick={() => setZoom(Math.max(.8, zoom - .1))} aria-label="Zoom out"><Minus size={17} /></button><button className="map-control" onClick={() => { setCity('Boston'); setSelected(null); }} aria-label="Reset map location"><LocateFixed size={16} /></button></div>
        {selectedVenue && <div className="map-preview"><img src={selectedVenue.image} alt="" /><div><div style={{ display: 'flex', justifyContent: 'space-between', gap: 4 }}><h4>{selectedVenue.name}</h4><button className={`heart-btn ${savedIds.includes(selectedVenue.id) ? 'saved' : ''}`} aria-label="Save venue" onClick={() => onToggle(selectedVenue.id)}><Heart size={15} fill={savedIds.includes(selectedVenue.id) ? 'currentColor' : 'none'} /></button></div><p>{selectedVenue.city} · {scoreVenue(selectedVenue, artist)}% fit</p><Link href={`/venue/${selectedVenue.id}`} style={{ fontSize: 10, color: '#287557', fontWeight: 700, textDecoration: 'none' }}>View venue <ChevronRight size={11} /></Link></div></div>}
      </div></div>
  </main>;
}