import { useEffect, useMemo, useState } from "react";
import { Bookmark, Building2, CalendarPlus, Mail, MapPin, Music2, Save, Search, UserRound } from "lucide-react";
import type { UserProfile } from "../../lib/authTypes";
import { EMPTY_BOOKER_PROFILE, type BookerProfile } from "../../lib/authTypes";
import {
  createBookerOpportunity,
  loadBookerOpportunities,
  loadBookerProfile,
  loadPublicArtists,
  loadSavedArtistIds,
  saveBookerProfile,
  setArtistSaved,
  type PostedOpportunity,
  type PublicArtist,
} from "../../lib/getgigsData";
import SafeImage from "../shared/SafeImage";

type Tab = "discover" | "saved" | "post" | "contacts" | "profile";

const NAV = [
  ["discover", "Discover Artists", Search],
  ["saved", "Saved Artists", Bookmark],
  ["post", "Post Opportunity", CalendarPlus],
  ["contacts", "Messages / Contacts", Mail],
  ["profile", "Profile", UserRound],
] as const;

export default function BookerDashboard({ account }: { account: UserProfile }) {
  const [tab, setTab] = useState<Tab>("discover");
  const [artists, setArtists] = useState<PublicArtist[]>([]);
  const [saved, setSaved] = useState<Set<string>>(new Set());
  const [profile, setProfile] = useState<BookerProfile>({ user_id: account.id, ...EMPTY_BOOKER_PROFILE, contact_name: account.display_name });
  const [opportunities, setOpportunities] = useState<PostedOpportunity[]>([]);
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    Promise.all([loadPublicArtists(), loadSavedArtistIds(account.id), loadBookerProfile(account.id), loadBookerOpportunities(account.id)])
      .then(([nextArtists, nextSaved, nextProfile, nextOpportunities]) => {
        if (!active) return;
        setArtists(nextArtists);
        setSaved(new Set(nextSaved));
        if (nextProfile) setProfile(nextProfile);
        setOpportunities(nextOpportunities);
      })
      .catch((error) => setNotice(error instanceof Error ? error.message : "Could not load the booker workspace."))
      .finally(() => setLoading(false));
    return () => { active = false; };
  }, [account.id]);

  const savedArtists = useMemo(() => artists.filter((artist) => saved.has(artist.user_id)), [artists, saved]);
  const toggleSaved = async (artistId: string) => {
    const nextSaved = !saved.has(artistId);
    setSaved((current) => { const next = new Set(current); nextSaved ? next.add(artistId) : next.delete(artistId); return next; });
    try { await setArtistSaved(account.id, artistId, nextSaved); }
    catch (error) { setNotice(error instanceof Error ? error.message : "Could not update saved artists."); }
  };

  return <div className="gg-role-shell">
    <header className="gg-role-header"><div><span className="gg-kicker">Looking for Artist</span><h1>{profile.organization_name || account.display_name || "Booker workspace"}</h1><p>Discover artists, prepare opportunities, and keep booking contacts in one place.</p></div></header>
    {notice && <div className="gg-role-notice" role="status">{notice}</div>}
    <div className="gg-role-content">
      {loading ? <EmptyState icon={<Music2/>} title="Loading artists…" copy="Your private workspace is being restored."/> : <>
        {tab === "discover" && <ArtistGrid title="Discover Artists" artists={artists} saved={saved} onToggleSaved={toggleSaved}/>}
        {tab === "saved" && <ArtistGrid title="Saved Artists" artists={savedArtists} saved={saved} onToggleSaved={toggleSaved}/>}
        {tab === "post" && <OpportunityComposer profile={profile} opportunities={opportunities} onCreated={async () => { setOpportunities(await loadBookerOpportunities(account.id)); setNotice("Opportunity saved to your account."); }}/>}
        {tab === "contacts" && <EmptyState icon={<Mail/>} title="Messages / Contacts" copy="Artist contact requests will appear here. Private artist details stay hidden until the artist shares them."/>}
        {tab === "profile" && <BookerProfileEditor profile={profile} onChange={setProfile} onSave={async () => { await saveBookerProfile(profile); setNotice("Organization profile saved."); }}/>}
      </>}
    </div>
    <nav className="gg-role-nav" aria-label="Booker navigation">{NAV.map(([id,label,Icon]) => <button key={id} type="button" className={tab===id?"active":""} onClick={() => setTab(id)}><Icon size={18}/><span>{label}</span></button>)}</nav>
  </div>;
}

function ArtistGrid({ title, artists, saved, onToggleSaved }: { title: string; artists: PublicArtist[]; saved: Set<string>; onToggleSaved: (id: string) => void }) {
  return <section><div className="gg-role-title"><span className="gg-kicker">Public artist profiles</span><h2>{title}</h2><p>{artists.length ? `${artists.length} artists ready to be discovered.` : "No public artist profiles yet. New artists will appear here after publishing their profile."}</p></div><div className="gg-artist-directory">{artists.map((artist) => <article key={artist.user_id}>
    <div className="gg-artist-image"><SafeImage src={artist.cover_photo_url || artist.profile_photo_url} alt={artist.artist_name}/></div>
    <div className="gg-artist-copy"><span>{artist.artist_type || "Artist"} · {[artist.city,artist.region].filter(Boolean).join(", ") || "Location not added"}</span><h3>{artist.artist_name}</h3><p>{artist.bio || "This artist is preparing their public booking profile."}</p><small>{artist.genres.join(" · ") || "Genres coming soon"}</small></div>
    <button type="button" className={saved.has(artist.user_id)?"saved":""} onClick={() => onToggleSaved(artist.user_id)}><Bookmark size={15} fill={saved.has(artist.user_id)?"currentColor":"none"}/>{saved.has(artist.user_id)?"Saved":"Save artist"}</button>
  </article>)}</div></section>;
}

function OpportunityComposer({ profile, opportunities, onCreated }: { profile: BookerProfile; opportunities: PostedOpportunity[]; onCreated: () => Promise<void> }) {
  const [draft, setDraft] = useState({ title: "", location: profile.location, description: "", genres: "", compensation: "", event_date: "", status: "open" as const });
  const [busy, setBusy] = useState(false);
  const submit = async (event: React.FormEvent) => { event.preventDefault(); setBusy(true); try { await createBookerOpportunity({ owner_id: profile.user_id, organization_name: profile.organization_name, ...draft, genres: draft.genres.split(",").map((item)=>item.trim()).filter(Boolean) }); setDraft({ title:"", location:profile.location, description:"", genres:"", compensation:"", event_date:"", status:"open" }); await onCreated(); } finally { setBusy(false); } };
  return <section><div className="gg-role-title"><span className="gg-kicker">Booking call</span><h2>Post Opportunity</h2><p>Create a real, account-owned opportunity for artists to discover.</p></div><form className="gg-account-form" onSubmit={submit}><Field label="Opportunity title" value={draft.title} required onChange={(title)=>setDraft({...draft,title})}/><Field label="Location" value={draft.location} onChange={(location)=>setDraft({...draft,location})}/><Field label="Genres" value={draft.genres} onChange={(genres)=>setDraft({...draft,genres})} placeholder="Indie rock, R&B"/><Field label="Compensation" value={draft.compensation} onChange={(compensation)=>setDraft({...draft,compensation})}/><Field label="Event date" value={draft.event_date} type="date" onChange={(event_date)=>setDraft({...draft,event_date})}/><Field label="Description" wide multiline value={draft.description} onChange={(description)=>setDraft({...draft,description})}/><button className="primary" disabled={busy}>{busy?"Saving…":"Publish opportunity"}</button></form><div className="gg-mini-list"><h3>Your opportunities</h3>{opportunities.map((item)=><div key={item.id}><strong>{item.title}</strong><span>{item.location} · {item.status}</span></div>)}</div></section>;
}

function BookerProfileEditor({ profile, onChange, onSave }: { profile: BookerProfile; onChange: (profile: BookerProfile)=>void; onSave:()=>Promise<void> }) {
  const [busy,setBusy]=useState(false);
  const update=(key:keyof BookerProfile,value:string|string[])=>onChange({...profile,[key]:value});
  return <section><div className="gg-role-title"><span className="gg-kicker">Organization profile</span><h2>Profile</h2><p>This private profile belongs only to your account. Public artist data does not reveal private booking contacts.</p></div><form className="gg-account-form" onSubmit={async(e)=>{e.preventDefault();setBusy(true);try{await onSave();}finally{setBusy(false)}}}><Field label="Organization / Venue name" value={profile.organization_name} onChange={(v)=>update("organization_name",v)}/><Field label="Contact name" value={profile.contact_name} onChange={(v)=>update("contact_name",v)}/><Field label="Website" value={profile.website} onChange={(v)=>update("website",v)}/><Field label="Location" value={profile.location} onChange={(v)=>update("location",v)}/><Field label="Venue type" value={profile.venue_type} onChange={(v)=>update("venue_type",v)}/><Field label="Capacity" value={profile.capacity} onChange={(v)=>update("capacity",v)}/><Field label="Genres" value={profile.genres.join(", ")} onChange={(v)=>update("genres",v.split(",").map(x=>x.trim()).filter(Boolean))}/><Field label="Description" wide multiline value={profile.description} onChange={(v)=>update("description",v)}/><button className="primary" disabled={busy}><Save size={15}/>{busy?"Saving…":"Save profile"}</button></form></section>;
}

function Field({ label, value, onChange, wide, multiline, required, placeholder, type="text" }: { label:string; value:string; onChange:(value:string)=>void; wide?:boolean; multiline?:boolean; required?:boolean; placeholder?:string; type?:string }) { return <label className={wide?"wide":""}><span>{label}</span>{multiline?<textarea rows={5} value={value} required={required} placeholder={placeholder} onChange={(e)=>onChange(e.target.value)}/>:<input type={type} value={value} required={required} placeholder={placeholder} onChange={(e)=>onChange(e.target.value)}/>}</label>; }
function EmptyState({ icon,title,copy }:{ icon:React.ReactNode; title:string; copy:string }) { return <div className="gg-empty-state"><span>{icon}</span><h2>{title}</h2><p>{copy}</p></div>; }
