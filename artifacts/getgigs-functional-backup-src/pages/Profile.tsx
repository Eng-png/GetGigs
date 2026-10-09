import { useEffect, useState } from 'react';
import { Check, RotateCcw } from 'lucide-react';
import type { Artist } from '../types';
import { ArtistFields } from '../components/ArtistFields';

function safeLink(value: string): string | null {
  try { const parsed = new URL(value); return parsed.protocol === 'https:' || parsed.protocol === 'http:' ? parsed.href : null; } catch { return null; }
}
export function Profile({ artist, onSave, onRevisit }: { artist: Artist; onSave: (artist: Artist) => void; onRevisit: () => void }) {
  const [form, setForm] = useState(artist);
  const [saved, setSaved] = useState(false);
  useEffect(() => setForm(artist), [artist]);
  const profileLinks = Object.entries(form.links).map(([key, link]) => ({ key, url: safeLink(link) })).filter((item): item is { key: string; url: string } => !!item.url);
  return <main className="page-wrap fade-in"><div className="eyebrow">The artist behind the search</div><h1 className="page-title">Your artist profile</h1><p className="lede">Your profile shapes the match score. Keep it current for more useful venue leads.</p>
    <div className="profile-grid"><aside className="card profile-identity"><div className="big-avatar">{form.name.slice(0, 1).toUpperCase()}</div><div><h2 style={{ font: '700 18px var(--app-font-serif)', margin: '0 0 4px' }}>{form.name}</h2><p style={{ fontSize: 12, color: '#78847d', margin: 0 }}>{form.artistType} · {form.city}</p><p style={{ fontSize: 12, color: '#78847d' }}>{form.genres.slice(0, 2).join(' · ')}</p><p style={{ fontSize: 12, color: '#78847d' }}>{form.monthlyListeners.toLocaleString()} monthly listeners · {form.socialFollowers.toLocaleString()} followers</p></div></aside>
      <section className="card profile-form"><div className="split-heading" style={{ marginBottom: 20 }}><div><h2 style={{ font: '700 20px var(--app-font-serif)', margin: '0 0 5px' }}>Your sound & situation</h2><span style={{ fontSize: 12, color: '#7a867f' }}>Used to calculate fit—not to gatekeep.</span></div>{saved && <span style={{ color: '#287557', fontSize: 12, fontWeight: 700 }} role="status"><Check size={14} /> Saved</span>}</div>
        <ArtistFields value={form} onChange={setForm} />
        {profileLinks.length > 0 && <section style={{ marginTop: 24 }} aria-labelledby="profile-links-heading"><h3 id="profile-links-heading" style={{ font: '700 16px var(--app-font-serif)' }}>Your live links</h3><div className="tag-row">{profileLinks.map((item) => <a key={item.key} className="button" href={item.url} target="_blank" rel="noreferrer">{item.key === 'appleMusic' ? 'Apple Music' : item.key.charAt(0).toUpperCase() + item.key.slice(1)} ↗</a>)}</div></section>}
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap', marginTop: 26 }}><button className="button" onClick={onRevisit}><RotateCcw size={15} /> Revisit setup</button><button className="button primary" onClick={() => { onSave(form); setSaved(true); window.setTimeout(() => setSaved(false), 2200); }} data-testid="button-save-profile">Save artist profile</button></div>
      </section>
    </div>
  </main>;
}