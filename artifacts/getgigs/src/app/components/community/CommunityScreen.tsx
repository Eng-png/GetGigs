import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, ImageIcon, MapPin, MessageCircle, Music2, Search, Users } from "lucide-react";
import type { PublicArtist } from "../../lib/getgigsData";
import { loadPublicArtists, sendArtistMessage } from "../../lib/getgigsData";
import SafeImage from "../shared/SafeImage";
import AvailabilityCalendar from "../availability/AvailabilityCalendar";

const FONT = "'Google Sans Flex', 'Google Sans', Inter, sans-serif";
const SERIF = "'Nyght Serif', 'Iowan Old Style', 'Times New Roman', serif";
const PAPER = "#fdfaf6";
const INK = "#11100e";
const CITRON = "#e6e83c";
const GOLD = "#bd8e3c";

type Props = { currentUserId?: string; onRequireAuth: () => void };

export default function CommunityScreen({ currentUserId, onRequireAuth }: Props) {
  const [artists, setArtists] = useState<PublicArtist[]>([]);
  const [selected, setSelected] = useState<PublicArtist | null>(null);
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [query, setQuery] = useState("");
  const [genre, setGenre] = useState("");
  const [location, setLocation] = useState("");
  const [artistType, setArtistType] = useState("");
  const [availability, setAvailability] = useState("");
  const [interest, setInterest] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [messageTarget, setMessageTarget] = useState<PublicArtist | null>(null);

  useEffect(() => {
    let active = true;
    loadPublicArtists().then((next) => {
      if (active) setArtists(next);
    }).catch((caught) => {
      if (active) setError(caught instanceof Error ? caught.message : "Could not load published artist profiles.");
    }).finally(() => {
      if (active) setLoading(false);
    });
    return () => { active = false; };
  }, []);

  const genres = useMemo(() => Array.from(new Set(artists.flatMap((artist) => artist.genres))).sort(), [artists]);
  const locations = useMemo(() => Array.from(new Set(artists.map((artist) => [artist.city, artist.region].filter(Boolean).join(", ")).filter(Boolean))).sort(), [artists]);
  const types = useMemo(() => Array.from(new Set(artists.map((artist) => artist.artist_type).filter(Boolean))).sort(), [artists]);
  const interests = useMemo(() => Array.from(new Set(artists.flatMap((artist) => artist.collaboration_interests))).sort(), [artists]);
  const viewer = artists.find((artist) => artist.user_id === currentUserId);
  const filteredArtists = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return artists.filter((artist) => {
      const artistLocation = [artist.city, artist.region].filter(Boolean).join(", ");
      return (!normalizedQuery || [artist.artist_name, artist.artist_type, artist.bio, ...artist.genres, ...artist.collaboration_interests].join(" ").toLowerCase().includes(normalizedQuery))
        && (!genre || artist.genres.includes(genre))
        && (!location || artistLocation === location)
        && (!artistType || artist.artist_type === artistType)
        && (!availability || artist.next_available_dates.length > 0)
        && (!interest || artist.collaboration_interests.includes(interest));
    });
  }, [artists, artistType, availability, currentUserId, genre, interest, location, query]);
  const recommended = useMemo(() => [...filteredArtists].sort((a, b) => matchScore(b, viewer) - matchScore(a, viewer)).slice(0, 4), [filteredArtists, viewer]);
  const sameGenre = useMemo(() => filteredArtists.filter((artist) => viewer && artist.genres.some((item) => viewer.genres.includes(item))).slice(0, 4), [filteredArtists, viewer]);
  const availableWhenYouAre = useMemo(() => filteredArtists.filter((artist) => viewer && artist.availability_public && artist.next_available_dates.some((date) => viewer.next_available_dates.includes(date))).slice(0, 4), [filteredArtists, viewer]);
  const collaborators = useMemo(() => filteredArtists.filter((artist) => artist.collaboration_interests.length > 0).slice(0, 4), [filteredArtists]);

  if (messageTarget) {
    return <MessageComposer artist={messageTarget} currentUserId={currentUserId} onRequireAuth={onRequireAuth} onClose={() => setMessageTarget(null)} />;
  }
  if (compareIds.length > 0) {
    return <Comparison artists={artists} selectedIds={compareIds} currentUserId={currentUserId} onBack={() => setCompareIds([])} onToggle={(id) => setCompareIds((current) => current.includes(id) ? current.length > 2 ? current.filter((value) => value !== id) : current : [...current, id])} />;
  }
  if (selected) {
    return <ArtistDetail artist={selected} currentUserId={currentUserId} onBack={() => setSelected(null)} onCompare={() => {
      const partner = filteredArtists.find((artist) => artist.user_id !== selected.user_id);
      setCompareIds([selected.user_id, ...(partner ? [partner.user_id] : [])]);
      setSelected(null);
    }} onMessage={() => {
      if (!currentUserId) onRequireAuth();
      else if (selected.user_id === currentUserId) return;
      else setMessageTarget(selected);
    }} />;
  }

  return <div data-no-edit style={{ width: "100%", height: "100%", overflow: "hidden", background: PAPER, color: INK, fontFamily: FONT }}>
    <style>{`.community-scroll::-webkit-scrollbar{display:none}`}</style>
    <div className="community-scroll" style={{ height: "100%", overflowY: "auto", scrollbarWidth: "none", paddingBottom: 112 }}>
      <header style={{ padding: "58px 20px 20px" }}>
        <span style={eyebrow}>Find collaborators and build the next show</span>
        <h1 style={heading}>Artist Network</h1>
        <p style={intro}>Discover published artists, find your musical and schedule fit, and message when the vibe feels right.</p>
      </header>
      <section style={{ display: "grid", gap: 9, padding: "0 20px" }}>
        <label style={searchLabel}><Search size={14} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search artists, sounds, roles" aria-label="Search artists" /></label>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 9 }}>
          <Select value={genre} onChange={setGenre} label="All genres" options={genres} />
          <Select value={location} onChange={setLocation} label="All locations" options={locations} />
          <Select value={artistType} onChange={setArtistType} label="All performer roles" options={types} />
          <Select value={availability} onChange={setAvailability} label="Any availability" options={["Has shared dates"]} />
        </div>
        <Select value={interest} onChange={setInterest} label="All collaboration interests" options={interests} />
      </section>
      {loading ? <EmptyState title="Loading artist profiles…" copy="Published profiles will appear here." /> : error ? <EmptyState title="Artist Network unavailable" copy={error} /> : !artists.length ? <EmptyState title="No published artist profiles yet" copy="Artists appear here automatically after they publish their profiles." /> : !filteredArtists.length ? <EmptyState title="No matching artists" copy="Try a different name, genre, role, location, or collaboration filter." /> : <>
        <Group title="Recommended for You" copy="Artists whose sound, role, location, or collab goals line up with yours." artists={recommended} onSelect={setSelected} />
        <Group title="Same Genre" copy="Keep the vibe going with artists in a similar lane." artists={sameGenre} onSelect={setSelected} />
        <Group title="Available When You Are" copy="Only shared dates are compared here. Availability is not a confirmed booking." artists={availableWhenYouAre} onSelect={setSelected} />
        <Group title="Looking to Collaborate" copy="Artists who have added public collaboration interests." artists={collaborators} onSelect={setSelected} />
        <section style={{ padding: "38px 20px 0" }}><span style={eyebrow}>All published artists</span><div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 10, marginTop: 14 }}>{filteredArtists.map((artist) => <ArtistCard key={artist.user_id} artist={artist} onSelect={setSelected} />)}</div></section>
      </>}
    </div>
  </div>;
}

function ArtistCard({ artist, onSelect }: { artist: PublicArtist; onSelect: (artist: PublicArtist) => void }) {
  return <button type="button" onClick={() => onSelect(artist)} style={cardButton}><SafeImage src={artist.profile_photo_url || artist.cover_photo_url} alt={artist.artist_name} style={{ display: "block", width: "100%", aspectRatio: "1.25", objectFit: "cover", borderRadius: 10 }} /><strong style={{ display: "block", marginTop: 9, fontFamily: SERIF, fontSize: 18, fontWeight: 500 }}>{artist.artist_name || "Unnamed artist"}</strong><span style={cardMeta}>{[artist.genres[0], artist.artist_type, artist.city].filter(Boolean).join(" · ") || "Artist profile"}</span><span style={cardMeta}>{artist.availability_public && artist.next_available_dates.length ? `Available ${artist.next_available_dates[0]}` : "Message to connect"}</span><span style={cardAction}>View Profile · Message</span></button>;
}

function Group({ title, copy, artists, onSelect }: { title: string; copy: string; artists: PublicArtist[]; onSelect: (artist: PublicArtist) => void }) {
  if (!artists.length) return null;
  return <section style={{ padding: "30px 20px 0" }}><span style={eyebrow}>{title}</span><p style={{ margin: "6px 0 12px", color: "rgba(0,0,0,.5)", fontSize: 9 }}>{copy}</p><div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 9 }}>{artists.map((artist) => <ArtistCard key={`${title}-${artist.user_id}`} artist={artist} onSelect={onSelect} />)}</div></section>;
}

function ArtistDetail({ artist, currentUserId, onBack, onCompare, onMessage }: { artist: PublicArtist; currentUserId?: string; onBack: () => void; onCompare: () => void; onMessage: () => void }) {
  const photos = Array.from(new Set([artist.profile_photo_url, artist.cover_photo_url].filter(Boolean)));
  return <section className="community-scroll" style={{ ...scrollPage, background: PAPER, color: INK }}>
    <section className="gg-community-artist-hero">
      <button type="button" onClick={onBack} style={heroBack}>← Back</button>
      <ArtistPhotoDeck photos={photos} artistName={artist.artist_name || "Artist"} />
      <div className="gg-community-artist-intro"><span style={{ color: CITRON, fontSize: 8, letterSpacing: 1.4, textTransform: "uppercase" }}>{[artist.artist_type, artist.city, artist.region].filter(Boolean).join(" · ")}</span><h1>{artist.artist_name || "Unnamed artist"}</h1><p>{artist.genres.join(" · ")}</p><small>Swipe the photo card or use the arrows to view this artist’s uploaded images.</small></div>
    </section>
    <section style={{ padding: "20px", display: "flex", gap: 8 }}><button type="button" disabled={Boolean(currentUserId && artist.user_id === currentUserId)} onClick={onMessage} style={{ ...primaryButton, opacity: currentUserId && artist.user_id === currentUserId ? .55 : 1, cursor: currentUserId && artist.user_id === currentUserId ? "default" : "pointer" }}><MessageCircle size={14} /> {currentUserId && artist.user_id === currentUserId ? "Your profile" : currentUserId ? "Message" : "Log in to message"}</button><button type="button" onClick={onCompare} style={secondaryButton}>Compare availability</button></section>
    <section style={{ padding: "4px 20px calc(120px + env(safe-area-inset-bottom))" }}><span style={eyebrow}>About the artist</span><p style={{ margin: "12px 0 0", fontFamily: SERIF, fontSize: 25, lineHeight: 1.35 }}>{artist.bio || "This artist has not added a public bio yet."}</p><div style={{ marginTop: 28, borderTop: "1px solid rgba(0,0,0,.16)" }}><DetailRow icon={<Music2 size={15} />} label="Sound" value={artist.genres.join(" · ") || "Not added"} /><DetailRow icon={<MapPin size={15} />} label="Based in" value={[artist.city, artist.region].filter(Boolean).join(", ") || "Not added"} /><DetailRow icon={<Users size={15} />} label="Performer role" value={artist.artist_type || "Not added"} /><DetailRow icon={<Users size={15} />} label="Looking to collaborate" value={artist.collaboration_interests.join(" · ") || "Not added"} />{artist.availability_public && <DetailRow icon={<Music2 size={15} />} label="Shared dates" value={artist.next_available_dates.join(" · ") || "Not added"} />}</div></section>
  </section>;
}

function ArtistPhotoDeck({ photos, artistName }: { photos: string[]; artistName: string }) {
  const [active, setActive] = useState(0);
  const pointerStartX = useRef<number | null>(null);
  const advance = (step: number) => setActive((current) => (current + step + photos.length) % photos.length);
  if (!photos.length) return <div className="gg-artist-photo-empty"><ImageIcon size={30}/><strong>Artist photos</strong><span>No public photos added yet.</span></div>;
  return <div className="gg-artist-photo-area">
    <div className="gg-artist-photo-deck" role="group" aria-label={`${artistName} photos`} tabIndex={0} onKeyDown={(event) => { if (photos.length < 2) return; if (event.key === "ArrowLeft") advance(-1); if (event.key === "ArrowRight") advance(1); }} onPointerDown={(event) => { pointerStartX.current = event.clientX; }} onPointerUp={(event) => { if (pointerStartX.current === null || photos.length < 2) return; const distance = event.clientX - pointerStartX.current; pointerStartX.current = null; if (Math.abs(distance) >= 40) advance(distance < 0 ? 1 : -1); }} onPointerCancel={() => { pointerStartX.current = null; }}>
      {photos.map((photo, index) => { const position = (index - active + photos.length) % photos.length; const front = position === 0; return <div key={photo} className="gg-artist-photo-card" aria-hidden={!front} style={{ zIndex: photos.length - position, opacity: position > 1 ? 0 : 1, transform: front ? "translate(0, 0) rotate(0deg)" : "translate(11px, -9px) rotate(2.5deg)" }}><SafeImage src={photo} alt={front ? `${artistName} photo ${active + 1}` : ""} style={{ width: "100%", height: "100%", objectFit: "cover" }}/><div className="gg-artist-photo-shade"/></div>; })}
      {photos.length > 1 && <><button type="button" className="gg-artist-photo-arrow previous" aria-label="Previous artist photo" onClick={() => advance(-1)}><ChevronLeft size={18}/></button><button type="button" className="gg-artist-photo-arrow next" aria-label="Next artist photo" onClick={() => advance(1)}><ChevronRight size={18}/></button></>}
      <span className="gg-artist-photo-count">{active + 1} / {photos.length}</span>
    </div>
    {photos.length > 1 && <div className="gg-artist-photo-dots" aria-hidden="true">{photos.map((_, index) => <span key={index} className={index === active ? "active" : ""}/>)}</div>}
  </div>;
}

function Comparison({ artists, selectedIds, currentUserId, onBack, onToggle }: { artists: PublicArtist[]; selectedIds: string[]; currentUserId?: string; onBack: () => void; onToggle: (id: string) => void }) {
  return <section className="community-scroll" style={{ ...scrollPage, padding: "42px 20px calc(120px + env(safe-area-inset-bottom))", background: PAPER }}><button type="button" onClick={onBack} style={backButton}>← Back to artists</button><h1 style={{ ...heading, fontSize: 36 }}>Compare gig windows</h1><p style={intro}>Choose two or more artists and find dates that work for the whole lineup.</p><div style={{ display: "flex", gap: 7, flexWrap: "wrap", marginBottom: 18 }}>{artists.filter((artist) => artist.user_id !== currentUserId).map((artist) => <button key={artist.user_id} type="button" onClick={() => onToggle(artist.user_id)} style={{ ...pillButton, background: selectedIds.includes(artist.user_id) ? INK : "#f4efe7", color: selectedIds.includes(artist.user_id) ? PAPER : INK }}>{artist.artist_name}</button>)}</div><AvailabilityCalendar userId={currentUserId} mode="shared" artistIds={selectedIds} title="Shared availability" /></section>;
}

function MessageComposer({ artist, currentUserId, onRequireAuth, onClose }: { artist: PublicArtist; currentUserId?: string; onRequireAuth: () => void; onClose: () => void }) {
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const send = async () => {
    if (!currentUserId) return onRequireAuth();
    setLoading(true); setError(""); setNotice("");
    try { await sendArtistMessage(artist.user_id, body); setBody(""); setNotice("Message sent. Your conversation is saved."); }
    catch (caught) { setError(caught instanceof Error ? caught.message : "Could not send your message."); }
    finally { setLoading(false); }
  };
  return <section className="community-scroll" style={{ ...scrollPage, padding: "42px 20px calc(120px + env(safe-area-inset-bottom))", background: PAPER }}><button type="button" onClick={onClose} style={backButton}>← Back to artists</button><div style={{ maxWidth: 620, margin: "24px auto 0", padding: 22, borderRadius: 20, background: "#f0ebe3" }}><span style={eyebrow}>Start a conversation</span><h1 style={{ ...heading, fontSize: 34 }}>Message {artist.artist_name || "this artist"}</h1><p style={intro}>Say hi, share a sound, or float a collab idea. Keep it friendly and specific.</p><textarea value={body} onChange={(event) => setBody(event.target.value)} maxLength={2000} rows={7} placeholder="Hey, I like your sound..." style={textarea} /><div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 10 }}><small style={cardMeta}>{body.length}/2000</small><button type="button" disabled={!body.trim() || loading} onClick={() => void send()} style={primaryButton}>{loading ? "Sending…" : <><MessageCircle size={14} /> Send message</>}</button></div>{notice && <p role="status" style={successText}>{notice}</p>}{error && <p role="alert" style={errorText}>{error}</p>}</div></section>;
}

function Select({ value, onChange, label, options }: { value: string; onChange: (value: string) => void; label: string; options: string[] }) {
  return <select value={value} onChange={(event) => onChange(event.target.value)} style={filterInput} aria-label={label}><option value="">{label}</option>{options.map((option) => <option key={option}>{option}</option>)}</select>;
}

function EmptyState({ title, copy }: { title: string; copy: string }) {
  return <section style={{ padding: "70px 20px", textAlign: "center" }}><h2 style={{ margin: 0, fontFamily: SERIF, fontSize: 28, fontWeight: 500 }}>{title}</h2><p style={{ margin: "12px auto 0", maxWidth: 420, color: "rgba(0,0,0,.5)", fontSize: 10 }}>{copy}</p></section>;
}

function DetailRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return <div style={{ minHeight: 64, display: "grid", gridTemplateColumns: "26px 130px minmax(0,1fr)", alignItems: "center", borderBottom: "1px solid rgba(0,0,0,.16)" }}><span>{icon}</span><span style={cardMeta}>{label}</span><strong style={{ fontFamily: SERIF, fontSize: 14, fontWeight: 500, textAlign: "right" }}>{value}</strong></div>;
}

function matchScore(artist: PublicArtist, viewer?: PublicArtist) {
  if (!viewer) return 0;
  const sharedGenres = artist.genres.filter((item) => viewer.genres.includes(item)).length;
  const sharedInterests = artist.collaboration_interests.filter((item) => viewer.collaboration_interests.includes(item)).length;
  const sameLocation = artist.city && viewer.city && artist.city.toLowerCase() === viewer.city.toLowerCase() ? 2 : 0;
  const sharedDates = artist.availability_public ? artist.next_available_dates.filter((date) => viewer.next_available_dates.includes(date)).length : 0;
  return sharedGenres * 4 + sharedInterests * 3 + sameLocation + sharedDates * 5;
}

const eyebrow: React.CSSProperties = { color: GOLD, fontSize: 8, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase" };
const heading: React.CSSProperties = { margin: "9px 0 0", fontFamily: SERIF, fontSize: 42, fontWeight: 500, lineHeight: .95, letterSpacing: -2 };
const intro: React.CSSProperties = { margin: "14px 0 0", maxWidth: 500, color: "rgba(0,0,0,.52)", fontSize: 11, lineHeight: 1.55 };
const searchLabel: React.CSSProperties = { minHeight: 42, padding: "0 12px", display: "flex", alignItems: "center", gap: 8, border: "1px solid rgba(0,0,0,.18)", borderRadius: 999, background: "#f4efe7" };
const filterInput: React.CSSProperties = { minHeight: 40, width: "100%", padding: "0 10px", border: "1px solid rgba(0,0,0,.18)", borderRadius: 10, background: "#f4efe7", color: INK, fontFamily: FONT, fontSize: 10 };
const cardButton: React.CSSProperties = { padding: 11, border: "1px solid rgba(0,0,0,.15)", borderRadius: 14, background: PAPER, color: INK, textAlign: "left", cursor: "pointer" };
const cardMeta: React.CSSProperties = { display: "block", marginTop: 5, color: "rgba(0,0,0,.5)", fontSize: 8 };
const cardAction: React.CSSProperties = { display: "block", marginTop: 9, color: GOLD, fontSize: 8, fontWeight: 700 };
const primaryButton: React.CSSProperties = { minHeight: 40, padding: "0 16px", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 7, border: 0, borderRadius: 999, background: CITRON, color: INK, fontFamily: FONT, fontSize: 10, fontWeight: 700, cursor: "pointer" };
const secondaryButton: React.CSSProperties = { ...primaryButton, background: "#f4efe7", border: "1px solid rgba(0,0,0,.15)" };
const pillButton: React.CSSProperties = { border: 0, borderRadius: 999, padding: "9px 13px", fontSize: 9, cursor: "pointer" };
const backButton: React.CSSProperties = { ...secondaryButton, marginBottom: 18 };
const heroBack: React.CSSProperties = { position: "absolute", top: 20, left: 20, padding: "8px 12px", border: "1px solid rgba(255,255,255,.5)", borderRadius: 999, background: "rgba(0,0,0,.35)", color: PAPER, cursor: "pointer" };
const textarea: React.CSSProperties = { width: "100%", boxSizing: "border-box", marginTop: 16, padding: 12, resize: "vertical", border: "1px solid rgba(0,0,0,.16)", borderRadius: 12, background: PAPER, color: INK, fontFamily: FONT, fontSize: 11 };
const successText: React.CSSProperties = { color: "#536000", fontSize: 9 };
const errorText: React.CSSProperties = { color: "#812d24", fontSize: 9 };
const scrollPage: React.CSSProperties = { height: "100%", overflowY: "auto", overscrollBehaviorY: "contain", WebkitOverflowScrolling: "touch", scrollbarWidth: "none" };
