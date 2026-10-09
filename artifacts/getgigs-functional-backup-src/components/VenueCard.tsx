import { Heart, MapPin } from 'lucide-react';
import { Link } from 'wouter';
import type { Venue } from '../types';

export function VenueCard({ venue, saved, onToggle }: { venue: Venue; saved: boolean; onToggle: (id: string) => void }) {
  return <article className="card venue-card" data-testid={`card-venue-${venue.id}`}>
    <Link href={`/venue/${venue.id}`}><img className="venue-photo" src={venue.image} alt={`${venue.name} live music venue`} loading="lazy" /></Link>
    <div className="venue-card-body">
      <div className="venue-title-row"><div><Link href={`/venue/${venue.id}`} style={{ textDecoration: 'none', color: 'inherit' }}><h3 className="venue-name">{venue.name}</h3></Link><p className="venue-loc"><MapPin size={12} style={{ verticalAlign: '-2px' }} /> {venue.city}, {venue.state}</p></div><Link href={`/venue/${venue.id}`} className="score score-link" title="See why this venue matches" aria-label={`${venue.score}% match. See why ${venue.name} matches`} data-testid={`link-match-score-${venue.id}`}>{venue.score}%</Link></div>
      <div className="tag-row">{venue.genres.slice(0, 3).map((genre) => <span className="tag" key={genre}>{genre}</span>)}</div>
      <div className="meta-line"><span>{venue.type} · {venue.capacity.toLocaleString()} cap</span><button className={`heart-btn ${saved ? 'saved' : ''}`} onClick={() => onToggle(venue.id)} aria-label={saved ? 'Remove from saved' : 'Save venue'} data-testid={`button-save-${venue.id}`}><Heart size={17} fill={saved ? 'currentColor' : 'none'} /></button></div>
    </div>
  </article>;
}