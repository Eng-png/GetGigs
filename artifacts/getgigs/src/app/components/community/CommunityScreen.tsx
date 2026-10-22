import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, MapPin, Music2, Search, Users } from "lucide-react";
import type { PublicArtist } from "../../lib/getgigsData";
import { loadPublicArtists } from "../../lib/getgigsData";
import SafeImage from "../shared/SafeImage";

const FONT = "'Google Sans Flex', 'Google Sans', Inter, sans-serif";
const SERIF = "'Nyght Serif', 'Iowan Old Style', 'Times New Roman', serif";
const PAPER = "#fdfaf6";
const INK = "#11100e";
const CITRON = "#e6e83c";
const GOLD = "#bd8e3c";

export default function CommunityScreen() {
  const [artists, setArtists] = useState<PublicArtist[]>([]);
  const [selected, setSelected] = useState<PublicArtist | null>(null);
  const [query, setQuery] = useState("");
  const [genre, setGenre] = useState("");
  const [location, setLocation] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    loadPublicArtists()
      .then((next) => { if (active) setArtists(next); })
      .catch((caught) => { if (active) setError(caught instanceof Error ? caught.message : "Could not load published artist profiles."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const genres = useMemo(() => Array.from(new Set(artists.flatMap((artist) => artist.genres))).sort((a, b) => a.localeCompare(b)), [artists]);
  const locations = useMemo(() => Array.from(new Set(artists.map((artist) => [artist.city, artist.region].filter(Boolean).join(", ")).filter(Boolean))).sort((a, b) => a.localeCompare(b)), [artists]);
  const filteredArtists = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return artists.filter((artist) => {
      const nameMatches = !normalizedQuery || [artist.artist_name, artist.artist_type, artist.bio].join(" ").toLowerCase().includes(normalizedQuery);
      const genreMatches = !genre || artist.genres.includes(genre);
      const artistLocation = [artist.city, artist.region].filter(Boolean).join(", ");
      const locationMatches = !location || artistLocation === location;
      return nameMatches && genreMatches && locationMatches;
    });
  }, [artists, genre, location, query]);

  return (
    <div data-no-edit style={{ width: "100%", height: "100%", overflow: "hidden", background: PAPER, color: INK, fontFamily: FONT }}>
      <style>{`.community-scroll::-webkit-scrollbar{display:none}`}</style>
      <div className="community-scroll" style={{ height: "100%", overflowY: "auto", scrollbarWidth: "none", paddingBottom: 112 }}>
        {selected ? <ArtistDetail artist={selected} onBack={() => setSelected(null)} /> : <CommunityIndex artists={filteredArtists} total={artists.length} genres={genres} locations={locations} query={query} genre={genre} location={location} loading={loading} error={error} onQueryChange={setQuery} onGenreChange={setGenre} onLocationChange={setLocation} onSelect={setSelected} />}
      </div>
    </div>
  );
}

function CommunityIndex({ artists, total, genres, locations, query, genre, location, loading, error, onQueryChange, onGenreChange, onLocationChange, onSelect }: { artists: PublicArtist[]; total: number; genres: string[]; locations: string[]; query: string; genre: string; location: string; loading: boolean; error: string; onQueryChange: (value: string) => void; onGenreChange: (value: string) => void; onLocationChange: (value: string) => void; onSelect: (artist: PublicArtist) => void }) {
  const featured = artists[0];
  return <>
    <header style={{ padding: "58px 20px 26px" }}>
      <span style={{ color: GOLD, fontSize: 8, fontWeight: 700, letterSpacing: 1.7, textTransform: "uppercase" }}>Meet the people making the noise</span>
      <h1 style={{ margin: "9px 0 0", fontFamily: SERIF, fontSize: 42, fontWeight: 500, lineHeight: .95, letterSpacing: -2 }}>Community</h1>
      <p style={{ margin: "15px 0 0", maxWidth: 360, color: "rgba(0,0,0,.52)", fontSize: 11, lineHeight: 1.55 }}>Discover published artist profiles and find people building shows in nearby scenes.</p>
    </header>

    <section style={{ display: "grid", gap: 9, padding: "0 20px" }}>
      <label style={searchLabel}><Search size={14}/><input value={query} onChange={(event) => onQueryChange(event.target.value)} placeholder="Search artists" aria-label="Search artists"/></label>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 9 }}>
        <select value={genre} onChange={(event) => onGenreChange(event.target.value)} style={filterInput} aria-label="Filter by genre"><option value="">All genres</option>{genres.map((item) => <option key={item} value={item}>{item}</option>)}</select>
        <select value={location} onChange={(event) => onLocationChange(event.target.value)} style={filterInput} aria-label="Filter by location"><option value="">All locations</option>{locations.map((item) => <option key={item} value={item}>{item}</option>)}</select>
      </div>
    </section>

    {loading ? <EmptyState title="Loading artist profiles…" copy="Published profiles will appear here." /> : error ? <EmptyState title="Artist profiles unavailable" copy={error} /> : !total ? <EmptyState title="No published artist profiles yet" copy="Artists will appear here after they publish their profiles." /> : !artists.length ? <EmptyState title="No matching artists" copy="Try a different name, genre, or location." /> : <>
      <section style={{ padding: "30px 20px 0" }}>
        <div style={{ display: "flex", alignItems: "end", justifyContent: "space-between", marginBottom: 18 }}>
          <div><span style={{ color: GOLD, fontSize: 8, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase" }}>Published artist profiles</span><h2 style={{ margin: "6px 0 0", fontFamily: SERIF, fontSize: 28, fontWeight: 500 }}>Around the scene</h2></div>
          <span style={{ color: "rgba(0,0,0,.35)", fontSize: 9 }}>{artists.length} artists</span>
        </div>
        {featured && <button type="button" onClick={() => onSelect(featured)} style={{ position: "relative", width: "100%", height: 360, padding: 0, overflow: "hidden", border: 0, borderRadius: 22, background: INK, color: PAPER, textAlign: "left", cursor: "pointer" }}>
          <SafeImage src={featured.cover_photo_url || featured.profile_photo_url} alt={featured.artist_name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          <span style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, transparent 30%, rgba(0,0,0,.86) 100%)" }} />
          <span style={{ position: "absolute", top: 15, left: 15, padding: "8px 11px", borderRadius: 999, background: CITRON, color: INK, fontSize: 8, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase" }}>Featured artist</span>
          <span style={{ position: "absolute", left: 18, right: 18, bottom: 18 }}><strong style={{ display: "block", fontFamily: SERIF, fontSize: 34, fontWeight: 500, lineHeight: 1 }}>{featured.artist_name || "Unnamed artist"}</strong><span style={{ display: "block", marginTop: 8, color: "rgba(255,255,255,.78)", fontSize: 9 }}>{[featured.artist_type, featured.city, featured.region].filter(Boolean).join(" · ")}</span><span style={{ display: "block", marginTop: 6, color: CITRON, fontSize: 9 }}>{featured.genres.join(" · ")}</span></span>
        </button>}
      </section>
      <section style={{ padding: "48px 20px 0" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 10 }}>
          {artists.slice(1).map((artist, index) => <button key={artist.user_id} type="button" onClick={() => onSelect(artist)} style={{ gridColumn: index === 2 ? "1 / -1" : undefined, padding: 0, overflow: "hidden", border: "1px solid rgba(0,0,0,.15)", borderRadius: 17, background: PAPER, color: INK, textAlign: "left", cursor: "pointer" }}>
            <SafeImage src={artist.cover_photo_url || artist.profile_photo_url} alt={artist.artist_name} style={{ display: "block", width: "100%", height: index === 2 ? 210 : 165, objectFit: "cover" }} />
            <span style={{ display: "block", padding: 13 }}><strong style={{ display: "block", fontFamily: SERIF, fontSize: 19, fontWeight: 500 }}>{artist.artist_name || "Unnamed artist"}</strong><span style={{ display: "block", marginTop: 5, color: "rgba(0,0,0,.5)", fontSize: 8 }}>{[artist.city, artist.region].filter(Boolean).join(", ") || "Location not added"}</span><span style={{ display: "block", marginTop: 6, color: GOLD, fontSize: 8 }}>{artist.genres.join(" · ") || "Genres not added"}</span></span>
          </button>)}
        </div>
      </section>
    </>}
  </>;
}

function ArtistDetail({ artist, onBack }: { artist: PublicArtist; onBack: () => void }) {
  return <>
    <section style={{ position: "relative", height: 560, overflow: "hidden", background: INK, color: PAPER }}>
      <SafeImage src={artist.cover_photo_url || artist.profile_photo_url} alt={artist.artist_name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(0,0,0,.44), transparent 42%, rgba(0,0,0,.88))" }} />
      <button type="button" onClick={onBack} aria-label="Back to community" style={{ position: "absolute", top: 22, left: 20, width: 38, height: 38, border: "1px solid rgba(255,255,255,.45)", borderRadius: "50%", display: "grid", placeItems: "center", background: "rgba(0,0,0,.3)", color: PAPER, cursor: "pointer" }}><ArrowLeft size={17} /></button>
      <div style={{ position: "absolute", left: 22, right: 22, bottom: 25 }}><span style={{ color: CITRON, fontSize: 8, fontWeight: 700, letterSpacing: 1.4, textTransform: "uppercase" }}>{[artist.artist_type, artist.city, artist.region].filter(Boolean).join(" · ")}</span><h1 style={{ margin: "8px 0 0", fontFamily: SERIF, fontSize: 46, fontWeight: 500, lineHeight: .95, letterSpacing: -2 }}>{artist.artist_name || "Unnamed artist"}</h1><p style={{ margin: "13px 0 0", color: "rgba(255,255,255,.78)", fontSize: 9 }}>{artist.genres.join(" · ")}</p></div>
    </section>
    <section style={{ padding: "48px 20px 0" }}><span style={{ color: GOLD, fontSize: 8, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase" }}>About the artist</span><p style={{ margin: "12px 0 0", fontFamily: SERIF, fontSize: 25, lineHeight: 1.35 }}>{artist.bio || "This artist has not added a public bio yet."}</p></section>
    <section style={{ padding: "48px 20px 20px" }}><h2 style={{ margin: "0 0 18px", fontFamily: SERIF, fontSize: 29, fontWeight: 500 }}>Artist details</h2><div style={{ borderTop: "1px solid rgba(0,0,0,.18)" }}><DetailRow icon={<Music2 size={15} />} label="Sound" value={artist.genres.join(" · ") || "Not added"} /><DetailRow icon={<MapPin size={15} />} label="Based in" value={[artist.city, artist.region].filter(Boolean).join(", ") || "Not added"} /><DetailRow icon={<Users size={15} />} label="Artist type" value={artist.artist_type || "Not added"} /></div></section>
  </>;
}

function DetailRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return <div style={{ minHeight: 70, padding: "13px 2px", borderBottom: "1px solid rgba(0,0,0,.18)", display: "grid", gridTemplateColumns: "26px 82px minmax(0,1fr)", alignItems: "center" }}><span>{icon}</span><span style={{ color: "rgba(0,0,0,.45)", fontSize: 9 }}>{label}</span><strong style={{ fontFamily: SERIF, fontSize: 14, fontWeight: 500, textAlign: "right" }}>{value}</strong></div>;
}

function EmptyState({ title, copy }: { title: string; copy: string }) {
  return <section style={{ padding: "48px 20px", textAlign: "center", color: "rgba(0,0,0,.55)" }}><h2 style={{ margin: 0, fontFamily: SERIF, fontSize: 27, fontWeight: 500, color: INK }}>{title}</h2><p style={{ margin: "12px auto 0", maxWidth: 420, fontSize: 11, lineHeight: 1.55 }}>{copy}</p></section>;
}

const searchLabel: React.CSSProperties = { minHeight: 42, padding: "0 12px", boxSizing: "border-box", display: "flex", alignItems: "center", gap: 8, border: "1px solid rgba(0,0,0,.18)", borderRadius: 999, background: "#f4efe7" };
const filterInput: React.CSSProperties = { minHeight: 40, padding: "0 10px", border: "1px solid rgba(0,0,0,.18)", borderRadius: 10, background: "#f4efe7", color: INK, fontFamily: FONT, fontSize: 10 };
