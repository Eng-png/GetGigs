import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Check, ExternalLink, MapPin, MessageCircle, Music2, Search, UserPlus, Users, X } from "lucide-react";
import type { ArtistConnection, PublicArtist } from "../../lib/getgigsData";
import { loadArtistConnections, loadPublicArtists, sendArtistMessage, updateArtistConnection } from "../../lib/getgigsData";
import SafeImage from "../shared/SafeImage";
import AvailabilityCalendar from "../availability/AvailabilityCalendar";

const FONT = "'Google Sans Flex', 'Google Sans', Inter, sans-serif";
const SERIF = "'Nyght Serif', 'Iowan Old Style', 'Times New Roman', serif";
const PAPER = "#fdfaf6";
const INK = "#11100e";
const CITRON = "#e6e83c";
const GOLD = "#bd8e3c";

type Props = { currentUserId?: string; onRequireAuth: () => void };
type NetworkView = "discover" | "requests" | "connections";

export default function CommunityScreen({ currentUserId, onRequireAuth }: Props) {
  const [artists, setArtists] = useState<PublicArtist[]>([]);
  const [connections, setConnections] = useState<ArtistConnection[]>([]);
  const [selected, setSelected] = useState<PublicArtist | null>(null);
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [view, setView] = useState<NetworkView>("discover");
  const [query, setQuery] = useState("");
  const [genre, setGenre] = useState("");
  const [location, setLocation] = useState("");
  const [artistType, setArtistType] = useState("");
  const [availability, setAvailability] = useState("");
  const [interest, setInterest] = useState("");
  const [loading, setLoading] = useState(true);
  const [connectionLoading, setConnectionLoading] = useState(false);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const [messageTarget, setMessageTarget] = useState<PublicArtist | null>(null);
  const [messageBody, setMessageBody] = useState("");
  const [messageLoading, setMessageLoading] = useState(false);
  const [messageNotice, setMessageNotice] = useState("");

  const refreshConnections = async () => {
    if (!currentUserId) { setConnections([]); return; }
    setConnections(await loadArtistConnections(currentUserId));
  };

  useEffect(() => {
    let active = true;
    loadPublicArtists().then((next) => { if (active) setArtists(next); }).catch((caught) => {
      if (active) setError(caught instanceof Error ? caught.message : "Could not load published artist profiles.");
    }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  useEffect(() => { void refreshConnections().catch((caught) => setActionError(caught instanceof Error ? caught.message : "Could not load your connections.")); }, [currentUserId]);

  const genres = useMemo(() => Array.from(new Set(artists.flatMap((artist) => artist.genres))).sort((a, b) => a.localeCompare(b)), [artists]);
  const locations = useMemo(() => Array.from(new Set(artists.map((artist) => [artist.city, artist.region].filter(Boolean).join(", ")).filter(Boolean))).sort((a, b) => a.localeCompare(b)), [artists]);
  const types = useMemo(() => Array.from(new Set(artists.map((artist) => artist.artist_type).filter(Boolean))).sort(), [artists]);
  const interests = useMemo(() => Array.from(new Set(artists.flatMap((artist) => artist.collaboration_interests))).sort(), [artists]);
  const filteredArtists = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return artists.filter((artist) => {
      if (artist.user_id === currentUserId) return false;
      const artistLocation = [artist.city, artist.region].filter(Boolean).join(", ");
      return (!normalizedQuery || [artist.artist_name, artist.artist_type, artist.bio, ...artist.genres, ...artist.collaboration_interests].join(" ").toLowerCase().includes(normalizedQuery))
        && (!genre || artist.genres.includes(genre))
        && (!location || artistLocation === location)
        && (!artistType || artist.artist_type === artistType)
        && (!availability || (availability === "shared" ? artist.availability_public && artist.next_available_dates.length > 0 : artist.next_available_dates.length > 0))
        && (!interest || artist.collaboration_interests.includes(interest));
    });
  }, [artists, artistType, availability, currentUserId, genre, interest, location, query]);

  const connectionByArtist = useMemo(() => {
    const map = new Map<string, ArtistConnection>();
    connections.forEach((connection) => map.set(connection.requester_id === currentUserId ? connection.recipient_id : connection.requester_id, connection));
    return map;
  }, [connections, currentUserId]);
  const incoming = connections.filter((connection) => connection.recipient_id === currentUserId && connection.status === "pending");
  const outgoing = connections.filter((connection) => connection.requester_id === currentUserId && connection.status === "pending");
  const connected = connections.filter((connection) => connection.status === "accepted");
  const artistById = useMemo(() => new Map(artists.map((artist) => [artist.user_id, artist])), [artists]);

  const runConnectionAction = async (artistId: string, action: "request" | "accept" | "decline" | "cancel", connectionId?: string) => {
    if (!currentUserId) { onRequireAuth(); return; }
    if (action === "request") {
      const target = artists.find((artist) => artist.user_id === artistId);
      if (target) { setMessageTarget(target); setMessageBody(""); setMessageNotice(""); }
      return;
    }
    setConnectionLoading(true); setActionError("");
    try {
      if (connectionId) await updateArtistConnection(connectionId, action);
      await refreshConnections();
    } catch (caught) {
      setActionError(caught instanceof Error ? caught.message : "Could not update this connection.");
    } finally { setConnectionLoading(false); }
  };

  return <div data-no-edit style={{ width: "100%", height: "100%", overflow: "hidden", background: PAPER, color: INK, fontFamily: FONT }}>
    <style>{`.community-scroll::-webkit-scrollbar{display:none}`}</style>
    <div className="community-scroll" style={{ height: "100%", overflowY: "auto", scrollbarWidth: "none", paddingBottom: 112 }}>
      {messageTarget ? <MessageComposer artist={messageTarget} currentUserId={currentUserId} body={messageBody} loading={messageLoading} notice={messageNotice} error={actionError} onBodyChange={setMessageBody} onClose={() => { setMessageTarget(null); setMessageBody(""); setMessageNotice(""); setActionError(""); }} onSend={async () => {
        if (!currentUserId) { onRequireAuth(); return; }
        setMessageLoading(true); setActionError(""); setMessageNotice("");
        try { await sendArtistMessage(messageTarget.user_id, messageBody); setMessageBody(""); setMessageNotice("Message sent. Your new conversation is saved."); }
        catch (caught) { setActionError(caught instanceof Error ? caught.message : "Could not send your message."); }
        finally { setMessageLoading(false); }
      }} /> : compareIds.length > 0 ? <section style={{ padding: "42px 20px 120px", background: PAPER, minHeight: "100%" }}><button type="button" onClick={() => setCompareIds([])} style={backButton}>← Back to artists</button><p style={{ margin: "0 0 10px", color: "rgba(0,0,0,.55)", fontSize: 9 }}>Pick two or more artists to compare their shared gig windows.</p><div style={{ display: "flex", gap: 7, flexWrap: "wrap", marginBottom: 16 }}>{artists.filter((artist) => artist.user_id !== currentUserId).map((artist) => <button key={artist.user_id} type="button"       onClick={() => setCompareIds((current) => current.includes(artist.user_id) ? current.length > 2 ? current.filter((id) => id !== artist.user_id) : current : [...current, artist.user_id])} style={{ ...pillButton, background: compareIds.includes(artist.user_id) ? INK : "#f4efe7", color: compareIds.includes(artist.user_id) ? PAPER : INK }}>{artist.artist_name}</button>)}</div><AvailabilityCalendar userId={currentUserId} mode="shared" artistIds={compareIds} title="Compare gig windows" /><p style={{ marginTop: 14, color: "rgba(0,0,0,.5)", fontSize: 9 }}>Shared availability is a planning signal, not a confirmed booking. Add more artists from the Network to build a lineup comparison.</p></section> : selected ? <ArtistDetail artist={selected} connection={connectionByArtist.get(selected.user_id)} currentUserId={currentUserId} loading={connectionLoading} onBack={() => setSelected(null)} onConnect={(action) => void runConnectionAction(selected.user_id, action, connectionByArtist.get(selected.user_id)?.id)}       onCompare={() => { const partner = artists.find((artist) => artist.user_id !== selected.user_id); setCompareIds([selected.user_id, ...(partner ? [partner.user_id] : [])]); setSelected(null); }} onRequireAuth={onRequireAuth} /> :
        <CommunityIndex artists={view === "discover" ? filteredArtists : []} total={artists.length} genres={genres} locations={locations} types={types} interests={interests} query={query} genre={genre} location={location} artistType={artistType} availability={availability} interest={interest} loading={loading} error={error || actionError} view={view} incoming={incoming} outgoing={outgoing} connected={connected} artistById={artistById} currentUserId={currentUserId} connectionLoading={connectionLoading} onViewChange={setView} onQueryChange={setQuery} onGenreChange={setGenre} onLocationChange={setLocation} onArtistTypeChange={setArtistType} onAvailabilityChange={setAvailability} onInterestChange={setInterest} onSelect={setSelected} onAction={(connectionId, action) => void runConnectionAction("", action, connectionId)} onRequireAuth={onRequireAuth} />}
    </div>
  </div>;
}

function CommunityIndex(props: {
  artists: PublicArtist[]; total: number; genres: string[]; locations: string[]; types: string[]; interests: string[]; query: string; genre: string; location: string; artistType: string; availability: string; interest: string; loading: boolean; error: string; view: NetworkView; incoming: ArtistConnection[]; outgoing: ArtistConnection[]; connected: ArtistConnection[]; artistById: Map<string, PublicArtist>; currentUserId?: string; connectionLoading: boolean; onViewChange: (view: NetworkView) => void; onQueryChange: (value: string) => void; onGenreChange: (value: string) => void; onLocationChange: (value: string) => void; onArtistTypeChange: (value: string) => void; onAvailabilityChange: (value: string) => void; onInterestChange: (value: string) => void; onSelect: (artist: PublicArtist) => void; onAction: (id: string, action: "accept" | "decline" | "cancel") => void; onRequireAuth: () => void;
}) {
  const viewer = props.currentUserId ? props.artistById.get(props.currentUserId) : undefined;
  const sameGenre = viewer ? props.artists.filter((artist) => artist.genres.some((item) => viewer.genres.includes(item))).slice(0, 4) : [];
  const availableWhenYouAre = viewer ? props.artists.filter((artist) => artist.availability_public && artist.next_available_dates.some((date) => viewer.next_available_dates.includes(date))).slice(0, 4) : [];
  const recommended = [...props.artists].sort((a, b) => matchScore(b, viewer) - matchScore(a, viewer)).slice(0, 4);
  return <><NetworkGroups groups={[
    { title: "Recommended for You", copy: "Artists whose sound, role, location, or collab goals line up with yours.", artists: recommended },
    { title: "Same Genre", copy: "Keep the vibe going with artists in a similar lane.", artists: sameGenre },
    { title: "Available When You Are", copy: "Based only on dates both artists have chosen to share.", artists: availableWhenYouAre },
    { title: "Looking to Collaborate", copy: "Artists who have added public collaboration interests.", artists: props.artists.filter((artist) => artist.collaboration_interests.length > 0).slice(0, 4) },
  ]} onSelect={props.onSelect} /><CommunityIndexContent {...props} /></>;
}

function CommunityIndexContent(props: {
  artists: PublicArtist[]; total: number; genres: string[]; locations: string[]; types: string[]; interests: string[]; query: string; genre: string; location: string; artistType: string; availability: string; interest: string; loading: boolean; error: string; view: NetworkView; incoming: ArtistConnection[]; outgoing: ArtistConnection[]; connected: ArtistConnection[]; artistById: Map<string, PublicArtist>; currentUserId?: string; connectionLoading: boolean; onViewChange: (view: NetworkView) => void; onQueryChange: (value: string) => void; onGenreChange: (value: string) => void; onLocationChange: (value: string) => void; onArtistTypeChange: (value: string) => void; onAvailabilityChange: (value: string) => void; onInterestChange: (value: string) => void; onSelect: (artist: PublicArtist) => void; onAction: (id: string, action: "accept" | "decline" | "cancel") => void; onRequireAuth: () => void;
}) {
  const { artists, total, genres, locations, types, interests, query, genre, location, artistType, availability, interest, loading, error, view, incoming, outgoing, connected, artistById, currentUserId, connectionLoading, onViewChange, onQueryChange, onGenreChange, onLocationChange, onArtistTypeChange, onAvailabilityChange, onInterestChange, onSelect, onAction, onRequireAuth } = props;
  const featured = artists[0];
  return <>
    <header style={{ padding: "58px 20px 20px" }}>
      <span style={{ color: GOLD, fontSize: 8, fontWeight: 700, letterSpacing: 1.7, textTransform: "uppercase" }}>Find collaborators and build the next show</span>
      <h1 style={{ margin: "9px 0 0", fontFamily: SERIF, fontSize: 42, fontWeight: 500, lineHeight: .95, letterSpacing: -2 }}>Artist Network</h1>
      <p style={{ margin: "15px 0 0", maxWidth: 370, color: "rgba(0,0,0,.52)", fontSize: 11, lineHeight: 1.55 }}>Discover published artists, explore their sound, and connect when the fit feels right.</p>
    </header>
    <div style={{ display: "flex", gap: 7, padding: "0 20px 22px", overflowX: "auto" }}>{(["discover", "requests", "connections"] as NetworkView[]).map((item) => <button key={item} type="button" onClick={() => onViewChange(item)} style={{ ...pillButton, background: view === item ? INK : "#f4efe7", color: view === item ? PAPER : INK }}>{item === "discover" ? "Discover" : item === "requests" ? `Requests${currentUserId && incoming.length + outgoing.length ? ` · ${incoming.length + outgoing.length}` : ""}` : `Connections${currentUserId && connected.length ? ` · ${connected.length}` : ""}`}</button>)}</div>
    {view === "discover" ? <>
      <section style={{ display: "grid", gap: 9, padding: "0 20px" }}>
        <label style={searchLabel}><Search size={14}/><input value={query} onChange={(event) => onQueryChange(event.target.value)} placeholder="Search artists, sounds, interests" aria-label="Search artists"/></label>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 9 }}><select value={genre} onChange={(event) => onGenreChange(event.target.value)} style={filterInput} aria-label="Filter by genre"><option value="">All genres</option>{genres.map((item) => <option key={item}>{item}</option>)}</select><select value={location} onChange={(event) => onLocationChange(event.target.value)} style={filterInput} aria-label="Filter by location"><option value="">All locations</option>{locations.map((item) => <option key={item}>{item}</option>)}</select><select value={artistType} onChange={(event) => onArtistTypeChange(event.target.value)} style={filterInput} aria-label="Filter by performer type"><option value="">All performer types</option>{types.map((item) => <option key={item}>{item}</option>)}</select><select value={availability} onChange={(event) => onAvailabilityChange(event.target.value)} style={filterInput} aria-label="Filter by availability"><option value="">Any availability</option><option value="shared">Shares next dates</option><option value="dates">Has next dates</option></select></div>
        <select value={interest} onChange={(event) => onInterestChange(event.target.value)} style={filterInput} aria-label="Filter by collaboration interest"><option value="">All collaboration interests</option>{interests.map((item) => <option key={item}>{item}</option>)}</select>
      </section>
      {loading ? <EmptyState title="Loading artist profiles…" copy="Published profiles will appear here." /> : error ? <EmptyState title="Artist Network unavailable" copy={error} /> : !total ? <EmptyState title="No published artist profiles yet" copy="Artists will appear here after they publish their profiles." /> : !artists.length ? <EmptyState title="No matching artists" copy="Try a different name, genre, location, or collaboration filter." /> : <><section style={{ padding: "30px 20px 0" }}><div style={{ display: "flex", alignItems: "end", justifyContent: "space-between", marginBottom: 18 }}><div><span style={{ color: GOLD, fontSize: 8, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase" }}>Published artist profiles</span><h2 style={{ margin: "6px 0 0", fontFamily: SERIF, fontSize: 28, fontWeight: 500 }}>Around the scene</h2></div><span style={{ color: "rgba(0,0,0,.35)", fontSize: 9 }}>{artists.length} artists</span></div>{featured && <button type="button" onClick={() => onSelect(featured)} style={featuredCard}><SafeImage src={featured.cover_photo_url || featured.profile_photo_url} alt={featured.artist_name} style={{ width: "100%", height: "100%", objectFit: "cover" }} /><span style={overlay}/><span style={featuredText}><strong style={{ display: "block", fontFamily: SERIF, fontSize: 34, fontWeight: 500, lineHeight: 1 }}>{featured.artist_name || "Unnamed artist"}</strong><span style={{ display: "block", marginTop: 8, color: "rgba(255,255,255,.78)", fontSize: 9 }}>{[featured.artist_type, featured.city, featured.region].filter(Boolean).join(" · ")}</span><span style={{ display: "block", marginTop: 6, color: CITRON, fontSize: 9 }}>{featured.genres.join(" · ")}</span></span></button>}</section><section style={{ padding: "48px 20px 0" }}><div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 10 }}>{artists.slice(1).map((artist, index) => <button key={artist.user_id} type="button" onClick={() => onSelect(artist)} style={{ gridColumn: index === 2 ? "1 / -1" : undefined, padding: 0, overflow: "hidden", border: "1px solid rgba(0,0,0,.15)", borderRadius: 17, background: PAPER, color: INK, textAlign: "left", cursor: "pointer" }}><SafeImage src={artist.cover_photo_url || artist.profile_photo_url} alt={artist.artist_name} style={{ display: "block", width: "100%", height: index === 2 ? 210 : 165, objectFit: "cover" }} /><span style={{ display: "block", padding: 13 }}><strong style={{ display: "block", fontFamily: SERIF, fontSize: 19, fontWeight: 500 }}>{artist.artist_name || "Unnamed artist"}</strong><span style={{ display: "block", marginTop: 5, color: "rgba(0,0,0,.5)", fontSize: 8 }}>{[artist.city, artist.region].filter(Boolean).join(", ") || "Location not added"}</span><span style={{ display: "block", marginTop: 6, color: GOLD, fontSize: 8 }}>{artist.genres.join(" · ") || "Genres not added"}</span></span></button>)}</div></section></>}
    </> : <ConnectionList view={view} connections={view === "requests" ? [...incoming, ...outgoing] : connected} incoming={incoming} currentUserId={currentUserId} artistById={artistById} loading={connectionLoading} onSelect={onSelect} onAction={onAction} onRequireAuth={onRequireAuth}/>}
  </>;
}

function matchScore(artist: PublicArtist, viewer?: PublicArtist) {
  if (!viewer) return 0;
  const sharedGenres = artist.genres.filter((genre) => viewer.genres.includes(genre)).length;
  const sharedInterests = artist.collaboration_interests.filter((interest) => viewer.collaboration_interests.includes(interest)).length;
  const sameLocation = artist.city && viewer.city && artist.city.toLowerCase() === viewer.city.toLowerCase() ? 2 : 0;
  const sharedDates = artist.availability_public ? artist.next_available_dates.filter((date) => viewer.next_available_dates.includes(date)).length : 0;
  return sharedGenres * 4 + sharedInterests * 3 + sameLocation + sharedDates * 5;
}

function NetworkGroups({ groups, onSelect }: { groups: Array<{ title: string; copy: string; artists: PublicArtist[] }>; onSelect: (artist: PublicArtist) => void }) {
  return <section style={{ padding: "0 20px 10px" }}>{groups.filter((group) => group.artists.length > 0).map((group) => <div key={group.title} style={{ marginTop: 28 }}><span style={{ color: GOLD, fontSize: 8, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase" }}>{group.title}</span><p style={{ margin: "6px 0 12px", color: "rgba(0,0,0,.5)", fontSize: 9 }}>{group.copy}</p><div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 9 }}>{group.artists.map((artist) => <button key={`${group.title}-${artist.user_id}`} type="button" onClick={() => onSelect(artist)} style={{ padding: 11, border: "1px solid rgba(0,0,0,.15)", borderRadius: 14, background: PAPER, color: INK, textAlign: "left", cursor: "pointer" }}><SafeImage src={artist.profile_photo_url} alt={artist.artist_name} style={{ width: "100%", aspectRatio: "1.25", objectFit: "cover", borderRadius: 9 }} /><strong style={{ display: "block", marginTop: 8, fontFamily: SERIF, fontSize: 16, fontWeight: 500 }}>{artist.artist_name || "Unnamed artist"}</strong><span style={{ display: "block", marginTop: 4, color: GOLD, fontSize: 8 }}>{artist.genres.slice(0, 2).join(" · ") || artist.artist_type || "Artist"}</span><span style={{ display: "block", marginTop: 4, color: "rgba(0,0,0,.5)", fontSize: 8 }}>{artist.city || "Location not added"} · Message to say hi</span></button>)}</div></div>)}</section>;
}

function ConnectionList({ view, connections, incoming, currentUserId, artistById, loading, onSelect, onAction, onRequireAuth }: { view: NetworkView; connections: ArtistConnection[]; incoming: ArtistConnection[]; currentUserId?: string; artistById: Map<string, PublicArtist>; loading: boolean; onSelect: (artist: PublicArtist) => void; onAction: (id: string, action: "accept" | "decline" | "cancel") => void; onRequireAuth: () => void }) {
  if (!currentUserId) return <EmptyState title="Log in to manage connections" copy="You can browse public artists as a guest, but connection requests require an account." action={<button type="button" onClick={onRequireAuth} style={primaryButton}>Log in to connect</button>} />;
  if (!connections.length) return <EmptyState title={view === "connections" ? "No connections yet" : "No pending requests"} copy={view === "connections" ? "Connect with another artist to start building your network." : "Incoming and outgoing requests will appear here."} />;
  return <section style={{ padding: "22px 20px" }}>{connections.map((connection) => { const otherId = connection.requester_id === currentUserId ? connection.recipient_id : connection.requester_id; const artist = artistById.get(otherId); if (!artist) return null; const isIncoming = incoming.some((item) => item.id === connection.id); return <article key={connection.id} style={connectionCard}><button type="button" onClick={() => onSelect(artist)} style={{ display: "flex", flex: 1, gap: 12, alignItems: "center", border: 0, background: "transparent", color: INK, textAlign: "left", cursor: "pointer" }}><SafeImage src={artist.profile_photo_url} alt={artist.artist_name} style={{ width: 54, height: 54, borderRadius: "50%", objectFit: "cover" }}/><span><strong style={{ display: "block", fontFamily: SERIF, fontSize: 20, fontWeight: 500 }}>{artist.artist_name}</strong><small style={{ color: "rgba(0,0,0,.5)" }}>{connection.status} · {[artist.city, artist.region].filter(Boolean).join(", ") || "Location not added"}</small></span></button>{view === "requests" && connection.status === "pending" && (isIncoming ? <span style={{ display: "flex", gap: 5 }}><button type="button" aria-label="Accept request" disabled={loading} onClick={() => onAction(connection.id, "accept")} style={iconButton}><Check size={15}/></button><button type="button" aria-label="Decline request" disabled={loading} onClick={() => onAction(connection.id, "decline")} style={iconButton}><X size={15}/></button></span> : <button type="button" disabled={loading} onClick={() => onAction(connection.id, "cancel")} style={smallButton}>Cancel</button>)}</article>; })}</section>;
}

function ArtistDetail({ artist, connection, currentUserId, loading, onBack, onConnect, onCompare, onMessage, onRequireAuth }: { artist: PublicArtist; connection?: ArtistConnection; currentUserId?: string; loading: boolean; onBack: () => void; onConnect: (action: "request" | "accept" | "decline" | "cancel") => void; onCompare: () => void; onMessage?: () => void; onRequireAuth: () => void }) {
  const action: string = !currentUserId ? "Message" : connection?.status === "accepted" ? "Message" : connection?.status === "pending" ? (connection.recipient_id === currentUserId ? "Request received" : "Cancel request") : "Message";
  return <><button type="button" onClick={onCompare} style={{ ...backButton, margin: "24px 20px 0" }}>Compare availability</button><section style={{ position: "relative", height: 560, overflow: "hidden", background: INK, color: PAPER }}><SafeImage src={artist.cover_photo_url || artist.profile_photo_url} alt={artist.artist_name} style={{ width: "100%", height: "100%", objectFit: "cover" }}/><div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(0,0,0,.44), transparent 42%, rgba(0,0,0,.88))" }}/><button type="button" onClick={onBack} aria-label="Back to network" style={{ position: "absolute", top: 22, left: 20, width: 38, height: 38, border: "1px solid rgba(255,255,255,.45)", borderRadius: "50%", display: "grid", placeItems: "center", background: "rgba(0,0,0,.3)", color: PAPER, cursor: "pointer" }}><ArrowLeft size={17}/></button><div style={{ position: "absolute", left: 22, right: 22, bottom: 25 }}><span style={{ color: CITRON, fontSize: 8, fontWeight: 700, letterSpacing: 1.4, textTransform: "uppercase" }}>{[artist.artist_type, artist.city, artist.region].filter(Boolean).join(" · ")}</span><h1 style={{ margin: "8px 0 0", fontFamily: SERIF, fontSize: 46, fontWeight: 500, lineHeight: .95, letterSpacing: -2 }}>{artist.artist_name || "Unnamed artist"}</h1><p style={{ margin: "13px 0 0", color: "rgba(255,255,255,.78)", fontSize: 9 }}>{artist.genres.join(" · ")}</p></div></section><section style={{ padding: "22px 20px 0", display: "flex", gap: 8 }}><button type="button" disabled={loading || action === "Connected" || action === "Request received"} onClick={() => !currentUserId ? onRequireAuth() : onConnect(action === "Cancel request" ? "cancel" : "request")} style={{ ...primaryButton, flex: 1 }}>{action === "Connect" && <UserPlus size={14}/>} {action}</button>{connection?.status === "pending" && connection.recipient_id === currentUserId && <><button type="button" disabled={loading} onClick={() => onConnect("accept")} style={secondaryButton}><Check size={14}/> Accept</button><button type="button" disabled={loading} onClick={() => onConnect("decline")} style={secondaryButton}><X size={14}/> Decline</button></>}</section><section style={{ padding: "28px 20px 0" }}><span style={{ color: GOLD, fontSize: 8, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase" }}>About the artist</span><p style={{ margin: "12px 0 0", fontFamily: SERIF, fontSize: 25, lineHeight: 1.35 }}>{artist.bio || "This artist has not added a public bio yet."}</p></section><section style={{ padding: "34px 20px 0" }}><h2 style={{ margin: "0 0 18px", fontFamily: SERIF, fontSize: 29, fontWeight: 500 }}>Artist details</h2><div style={{ borderTop: "1px solid rgba(0,0,0,.18)" }}><DetailRow icon={<Music2 size={15}/>} label="Sound" value={artist.genres.join(" · ") || "Not added"}/><DetailRow icon={<MapPin size={15}/>} label="Based in" value={[artist.city, artist.region].filter(Boolean).join(", ") || "Not added"}/><DetailRow icon={<Users size={15}/>} label="Performers" value={`${artist.performer_count || 1}`}/><DetailRow icon={<Users size={15}/>} label="Collaborates on" value={artist.collaboration_interests.join(" · ") || "Not added"}/>{artist.availability_public && <DetailRow icon={<Music2 size={15}/>} label="Next dates" value={artist.next_available_dates.join(" · ") || "Not added"}/>}</div><div style={{ display: "flex", gap: 9, flexWrap: "wrap", paddingTop: 18 }}>{[["Website", artist.website], ["Spotify", artist.spotify_url], ["YouTube", artist.youtube_url], ["Instagram", artist.instagram_url]].filter(([, value]) => value).map(([label, value]) => <a key={label} href={value} target="_blank" rel="noreferrer" style={{ ...smallButton, textDecoration: "none" }}><ExternalLink size={12}/>{label}</a>)}</div></section></>;
}

function MessageComposer({ artist, currentUserId, body, loading, notice, error, onBodyChange, onClose, onSend }: { artist: PublicArtist; currentUserId?: string; body: string; loading: boolean; notice: string; error: string; onBodyChange: (value: string) => void; onClose: () => void; onSend: () => void }) {
  return <section style={{ minHeight: "100%", padding: "42px 20px 120px", background: PAPER }}>
    <button type="button" onClick={onClose} style={backButton}>← Back to artists</button>
    <div style={{ maxWidth: 620, margin: "24px auto 0", padding: 22, borderRadius: 20, background: "#f0ebe3" }}>
      <span style={{ color: GOLD, fontSize: 8, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase" }}>Start a conversation</span>
      <h1 style={{ margin: "8px 0 0", fontFamily: SERIF, fontSize: 34, fontWeight: 500 }}>Message {artist.artist_name || "this artist"}</h1>
      <p style={{ margin: "12px 0 0", color: "rgba(0,0,0,.55)", fontSize: 10, lineHeight: 1.5 }}>Say hi, share a sound, or float a collab idea. Keep it friendly and specific.</p>
      <textarea value={body} onChange={(event) => onBodyChange(event.target.value)} maxLength={2000} rows={7} placeholder="Hey, I like your sound..." style={{ width: "100%", boxSizing: "border-box", marginTop: 16, padding: 12, resize: "vertical", border: "1px solid rgba(0,0,0,.16)", borderRadius: 12, background: PAPER, color: INK, fontFamily: FONT, fontSize: 11 }} />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, marginTop: 10 }}>
        <small style={{ color: "rgba(0,0,0,.45)" }}>{body.length}/2000</small>
        <button type="button" disabled={!currentUserId || !body.trim() || loading} onClick={onSend} style={primaryButton}>{loading ? "Sending…" : <><MessageCircle size={14}/> Send message</>}</button>
      </div>
      {notice && <p role="status" style={{ color: "#536000", fontSize: 9 }}>{notice}</p>}
      {error && <p role="alert" style={{ color: "#812d24", fontSize: 9 }}>{error}</p>}
    </div>
  </section>;
}

function DetailRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) { return <div style={{ minHeight: 70, padding: "13px 2px", borderBottom: "1px solid rgba(0,0,0,.18)", display: "grid", gridTemplateColumns: "26px 92px minmax(0,1fr)", alignItems: "center" }}><span>{icon}</span><span style={{ color: "rgba(0,0,0,.45)", fontSize: 9 }}>{label}</span><strong style={{ fontFamily: SERIF, fontSize: 14, fontWeight: 500, textAlign: "right" }}>{value}</strong></div>; }
function EmptyState({ title, copy, action }: { title: string; copy: string; action?: React.ReactNode }) { return <section style={{ padding: "48px 20px", textAlign: "center", color: "rgba(0,0,0,.55)" }}><h2 style={{ margin: 0, fontFamily: SERIF, fontSize: 27, fontWeight: 500, color: INK }}>{title}</h2><p style={{ margin: "12px auto 0", maxWidth: 420, fontSize: 11, lineHeight: 1.55 }}>{copy}</p>{action && <div style={{ marginTop: 18 }}>{action}</div>}</section>; }

const searchLabel: React.CSSProperties = { minHeight: 42, padding: "0 12px", boxSizing: "border-box", display: "flex", alignItems: "center", gap: 8, border: "1px solid rgba(0,0,0,.18)", borderRadius: 999, background: "#f4efe7" };
const filterInput: React.CSSProperties = { minHeight: 40, padding: "0 10px", border: "1px solid rgba(0,0,0,.18)", borderRadius: 10, background: "#f4efe7", color: INK, fontFamily: FONT, fontSize: 10 };
const pillButton: React.CSSProperties = { border: 0, borderRadius: 999, padding: "9px 13px", fontSize: 9, textTransform: "capitalize", whiteSpace: "nowrap", cursor: "pointer" };
const primaryButton: React.CSSProperties = { minHeight: 40, border: 0, borderRadius: 999, padding: "0 16px", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 7, background: CITRON, color: INK, fontFamily: FONT, fontSize: 10, fontWeight: 700, cursor: "pointer" };
const secondaryButton: React.CSSProperties = { ...primaryButton, background: "#f4efe7", border: "1px solid rgba(0,0,0,.15)" };
const smallButton: React.CSSProperties = { minHeight: 32, padding: "0 10px", display: "inline-flex", alignItems: "center", gap: 5, border: "1px solid rgba(0,0,0,.18)", borderRadius: 999, background: "#f4efe7", color: INK, fontFamily: FONT, fontSize: 9, cursor: "pointer" };
const backButton: React.CSSProperties = { ...smallButton, marginBottom: 18 };
const iconButton: React.CSSProperties = { ...smallButton, width: 32, justifyContent: "center", padding: 0 };
const featuredCard: React.CSSProperties = { position: "relative", width: "100%", height: 360, padding: 0, overflow: "hidden", border: 0, borderRadius: 22, background: INK, color: PAPER, textAlign: "left", cursor: "pointer" };
const overlay: React.CSSProperties = { position: "absolute", inset: 0, background: "linear-gradient(to bottom, transparent 30%, rgba(0,0,0,.86) 100%)" };
const featuredText: React.CSSProperties = { position: "absolute", left: 18, right: 18, bottom: 18 };
const connectionCard: React.CSSProperties = { display: "flex", gap: 12, alignItems: "center", padding: 12, marginBottom: 10, border: "1px solid rgba(0,0,0,.15)", borderRadius: 16, background: PAPER };
