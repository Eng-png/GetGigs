import { useState } from 'react';
import { Link, useParams } from 'wouter';
import { Accessibility, ArrowLeft, Clock3, ExternalLink, Heart, Mail, MapPin, Music2, Ticket, Users } from 'lucide-react';
import { venues } from '../data/venues';
import { scoreWeights } from '../data/constants';
import type { Artist } from '../types';
import { getEffectiveFactors, scoreVenue } from '../utils/scoring';

export function VenuePage({ artist, savedIds, onToggle }: { artist: Artist; savedIds: string[]; onToggle: (id: string) => void }) {
  const { id = '' } = useParams();
  const venue = venues.find((item) => item.id === id);
  const [copied, setCopied] = useState(false);
  if (!venue) return <main className="page-wrap"><div className="empty-state"><h3>We couldn’t find that venue</h3><Link href="/matchmap" className="button">Back to Matchmap</Link></div></main>;
  const score = scoreVenue(venue, artist);
  const factors = getEffectiveFactors(venue, artist);
  const email = venue.email.trim();
  const overlappingGenre = venue.genres.find((genre) => artist.genres.includes(genre));
  const matchReason = `This ${venue.type.toLowerCase()} regularly features ${overlappingGenre ? `${overlappingGenre} artists` : 'artists across a range of sounds'} and its ${venue.capacity.toLocaleString()}-person capacity can suit an audience like yours (${artist.typicalAudienceSize}).`;
  const facts = [
    { label: 'Capacity', value: `${venue.capacity.toLocaleString()} people`, icon: <Users size={16} /> },
    { label: 'Venue type', value: venue.type, icon: <Music2 size={16} /> },
    { label: 'Typical audience', value: venue.audience, icon: <Users size={16} /> },
    { label: 'Typical show format', value: venue.style, icon: <Music2 size={16} /> },
    { label: 'Typical ticket', value: venue.ticket, icon: <Ticket size={16} /> },
    { label: 'Age policy', value: venue.age, icon: <Clock3 size={16} /> },
    { label: 'Accessibility', value: venue.accessibility, icon: <Accessibility size={16} /> },
  ];
  return <main className="page-wrap fade-in"><Link href="/matchmap" className="button ghost"><ArrowLeft size={15} /> All venues</Link>
    <div className="venue-detail-hero"><img src={venue.image} alt={`${venue.name} live performance`} /><div className="hero-overlay"><div><span className="eyebrow" style={{ color: '#d0e6d7' }}>VENUE PROFILE</span><h1>{venue.name}</h1><span><MapPin size={14} style={{ verticalAlign: '-2px' }} /> {venue.address}</span></div><div style={{ marginLeft: 'auto', display: 'flex', gap: 10, alignItems: 'center' }}><div className="score" style={{ width: 58, height: 58, fontSize: 17 }}>{score}%</div><button className={`button ${savedIds.includes(venue.id) ? '' : 'primary'}`} onClick={() => onToggle(venue.id)} data-testid="button-venue-save"><Heart size={15} fill={savedIds.includes(venue.id) ? 'currentColor' : 'none'} />{savedIds.includes(venue.id) ? 'Saved' : 'Save venue'}</button></div></div></div>
    <div className="detail-columns"><section className="card detail-panel"><h2>About this room</h2><p style={{ fontSize: 14, color: '#65736c', lineHeight: 1.7 }}>{venue.description}</p><div className="tag-row" style={{ marginBottom: 22 }}>{venue.genres.map((genre) => <span className="tag" key={genre}>{genre}</span>)}</div><h2>At a glance</h2><div className="detail-facts">{facts.map((fact) => <div className="fact" key={fact.label}><span>{fact.icon} {fact.label}</span><strong>{fact.value}</strong></div>)}</div><h2 style={{ marginTop: 24 }}>Room & equipment</h2><div className="tag-row">{venue.equipment.map((item) => <span className="tag" key={item}>{item}</span>)}</div></section>
       <aside style={{ display: 'grid', gap: 18, alignContent: 'start' }}><section className="card detail-panel" id="match-explanation"><h2>Why this venue matches you</h2><p className="match-reason">{matchReason}</p><p style={{ fontSize: 12, color: '#79857e', marginTop: 0 }}>Personalized fit factors used in the {score}% score.</p><div className="score-breakdown">{scoreWeights.map(({ key, label, weight }) => { const value = factors[key]; return <div className="score-row" key={key}><span>{label} <small style={{ color: '#9aa39d' }}>· {weight}% weight</small></span><strong>{value}%</strong><div className="score-track"><i style={{ width: `${value}%` }} /></div></div>; })}</div></section>
        <section className="card detail-panel"><h2>Booking details</h2><div style={{ display: 'grid', gap: 13, fontSize: 13, color: '#56655d' }}><div><b>Website</b><p style={{ margin: '4px 0', color: '#7b8780' }}><a href={venue.website} target="_blank" rel="noreferrer">{venue.website.replace(/^https?:\/\//, '')}</a></p></div><div><b>Booking contact</b><p style={{ margin: '4px 0', color: '#7b8780' }}>{email}</p></div><div><b>How to book</b><p style={{ margin: '4px 0', color: '#7b8780' }}>{venue.booking}</p></div><div><b>Typical lead time</b><p style={{ margin: '4px 0', color: '#7b8780' }}>{venue.lead}</p></div><button className="button primary" onClick={() => { void navigator.clipboard?.writeText(email).then(() => setCopied(true)).catch(() => setCopied(true)); }} data-testid="button-copy-contact"><Mail size={15} />{copied ? 'Contact copied' : 'Copy booking contact'}</button><a className="button" style={{ textDecoration: 'none' }} href={`mailto:${email}?subject=${encodeURIComponent(`Booking inquiry — ${venue.name}`)}`}><ExternalLink size={14} /> Open email draft</a></div></section></aside>
    </div>
  </main>;
}