import { Check } from 'lucide-react';
import { artistTypes, cities, genres, venueTypes } from '../data/constants';
import type { Artist } from '../types';

export function ArtistFields({ value, onChange, includeLinks = true }: { value: Artist; onChange: (artist: Artist) => void; includeLinks?: boolean }) {
  const update = <K extends keyof Artist>(key: K, next: Artist[K]) => onChange({ ...value, [key]: next });
  const toggle = (key: 'genres' | 'preferredCities' | 'preferredVenueTypes', item: string) => {
    const current = value[key] as string[];
    update(key, (current.includes(item) ? current.filter((entry) => entry !== item) : [...current, item]) as Artist[typeof key]);
  };
  const field = (label: string, key: keyof Artist, props: { type?: string; numeric?: boolean } = {}) => <div className="form-group" key={key}><label htmlFor={`artist-${key}`}>{label}</label><input id={`artist-${key}`} className="field" type={props.type || 'text'} value={String(value[key])} onChange={(event) => update(key, (props.numeric ? Number(event.target.value) : event.target.value) as Artist[typeof key])} data-testid={`input-artist-${key}`} /></div>;
  const choices = (label: string, key: 'genres' | 'preferredCities' | 'preferredVenueTypes', options: string[]) => <div className="form-group" key={key}><label>{label}</label><div className="chip-select">{options.map((option) => <button type="button" key={option} aria-pressed={value[key].includes(option)} onClick={() => toggle(key, option)} className={`chip ${value[key].includes(option) ? 'selected' : ''}`} data-testid={`choice-${key}-${option.toLowerCase().replaceAll(/[^a-z0-9]+/g, '-')}`}>{value[key].includes(option) && <Check size={12} />} {option}</button>)}</div></div>;
  const links: Array<[keyof Artist['links'], string]> = [['spotify', 'Spotify'], ['appleMusic', 'Apple Music'], ['youtube', 'YouTube'], ['soundcloud', 'SoundCloud'], ['instagram', 'Instagram'], ['tiktok', 'TikTok']];
  return <>
    <div className="form-grid">
      {field('Artist / project name', 'name')}
      <div className="form-group"><label htmlFor="artist-type">Artist type</label><select id="artist-type" className="select" value={value.artistType} onChange={(e) => update('artistType', e.target.value)}>{artistTypes.map((option) => <option key={option}>{option}</option>)}</select></div>
      <div className="form-group"><label htmlFor="artist-city">Home city</label><select id="artist-city" className="select" value={value.city} onChange={(e) => update('city', e.target.value)}>{cities.map((option) => <option key={option}>{option}</option>)}</select></div>
      {field('Booking email', 'email', { type: 'email' })}
      {field('Monthly listeners', 'monthlyListeners', { type: 'number', numeric: true })}
      {field('Social followers', 'socialFollowers', { type: 'number', numeric: true })}
      <div className="form-group"><label htmlFor="artist-draw">Typical audience size</label><select id="artist-draw" className="select" value={value.typicalAudienceSize} onChange={(e) => update('typicalAudienceSize', e.target.value)}>{['Under 100', '100–250', '250–500', '500+', 'Any'].map((option) => <option key={option}>{option}</option>)}</select></div>
      <div className="form-group"><label htmlFor="artist-stage">Career stage</label><select id="artist-stage" className="select" value={value.stage} onChange={(e) => update('stage', e.target.value)}>{['Emerging', 'Growing', 'Established', 'Touring'].map((option) => <option key={option}>{option}</option>)}</select></div>
      <div className="form-group"><label htmlFor="artist-style">Performance style</label><select id="artist-style" className="select" value={value.style} onChange={(e) => update('style', e.target.value)}>{['Full band', 'Solo / acoustic', 'Electronic', 'DJ set', 'Flexible'].map((option) => <option key={option}>{option}</option>)}</select></div>
      <div className="form-group"><label htmlFor="artist-range">Capacity range</label><select id="artist-range" className="select" value={value.capacity} onChange={(e) => update('capacity', e.target.value)}>{['Under 150', '150–500', '500+', 'Any'].map((option) => <option key={option}>{option}</option>)}</select></div>
      <div className="form-group"><label htmlFor="artist-travel">Willing to travel?</label><select id="artist-travel" className="select" value={value.willingToTravel ? 'Yes' : 'No'} onChange={(e) => update('willingToTravel', e.target.value === 'Yes')}><option>Yes</option><option>No</option></select></div>
      <div className="form-group"><label htmlFor="artist-miles">Travel radius (miles)</label><input id="artist-miles" className="field" type="number" min="0" value={value.travelMiles} onChange={(e) => update('travelMiles', Number(e.target.value))} /></div>
      <div className="form-group"><label htmlFor="artist-audience">Audience description</label><input id="artist-audience" className="field" value={value.audience} onChange={(e) => update('audience', e.target.value)} /></div>
    </div>
    <div className="form-group" style={{ marginTop: 18 }}>{choices('Genres', 'genres', genres)}</div>
    <div className="form-group" style={{ marginTop: 18 }}>{choices('Preferred cities', 'preferredCities', cities)}</div>
    <div className="form-group" style={{ marginTop: 18 }}>{choices('Preferred venue types', 'preferredVenueTypes', venueTypes)}</div>
    {includeLinks && <div className="form-grid" style={{ marginTop: 20 }}>{links.map(([key, label]) => <div className="form-group" key={key}><label htmlFor={`link-${key}`}>{label} link</label><input id={`link-${key}`} className="field" type="url" placeholder="https://" value={value.links[key]} onChange={(e) => update('links', { ...value.links, [key]: e.target.value })} data-testid={`input-link-${key}`} /></div>)}</div>}
  </>;
}