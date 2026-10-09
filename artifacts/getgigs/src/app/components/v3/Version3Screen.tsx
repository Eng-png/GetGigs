import { useEffect, useState } from "react";
import { Camera, Check, Link, Mail, MapPin, Music2, Pencil, Play, Save, Upload, Video } from "lucide-react";

const FONT = "'Google Sans Flex', 'Google Sans', Inter, sans-serif";
const SERIF = "'Nyght Serif', 'Iowan Old Style', 'Times New Roman', serif";
const PAPER = "#fdfaf6";
const INK = "#11100e";
const CITRON = "#e6e83c";
const GOLD = "#bd8e3c";
const STORAGE_KEY = "getgigs-artist-profile-v2";

type ArtistProfile = {
  name: string;
  artistType: string;
  city: string;
  genres: string;
  bio: string;
  performanceStyle: string;
  preferredRooms: string;
  travelRadius: string;
  bookingEmail: string;
  spotify: string;
  instagram: string;
  youtube: string;
  cover: string;
  visuals: string[];
};

const DEFAULT_PROFILE: ArtistProfile = {
  name: "",
  artistType: "",
  city: "",
  genres: "",
  bio: "",
  performanceStyle: "",
  preferredRooms: "",
  travelRadius: "",
  bookingEmail: "",
  spotify: "",
  instagram: "",
  youtube: "",
  cover: "",
  visuals: ["", "", "", ""],
};

function loadProfile(): ArtistProfile {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    const parsed = stored ? JSON.parse(stored) : {};
    return { ...DEFAULT_PROFILE, ...parsed, visuals: Array.isArray(parsed.visuals) ? [...parsed.visuals, "", "", ""].slice(0, 4) : DEFAULT_PROFILE.visuals };
  } catch {
    return DEFAULT_PROFILE;
  }
}

export default function Version3Screen() {
  const [profile, setProfile] = useState<ArtistProfile>(loadProfile);
  const [draft, setDraft] = useState<ArtistProfile>(profile);
  const [editing, setEditing] = useState(false);
  const [saved, setSaved] = useState(false);
  const [performanceVideo, setPerformanceVideo] = useState("");
  const [performanceVideoName, setPerformanceVideoName] = useState("");

  useEffect(() => {
    window.localStorage.removeItem("yondr-editable-copy-profile");
  }, []);

  const persist = (next: ArtistProfile) => {
    setProfile(next);
    setDraft(next);
    try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch { /* image remains available for this session */ }
  };

  const uploadCover = async (file?: File) => {
    if (!file) return;
    persist({ ...profile, cover: await compressImage(file, 1500, .84) });
  };

  const uploadVisual = async (index: number, file?: File) => {
    if (!file) return;
    const visuals = [...profile.visuals];
    visuals[index] = await compressImage(file, 1100, .82);
    persist({ ...profile, visuals });
  };

  const saveProfile = () => {
    persist(draft);
    setEditing(false);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2200);
  };

  const uploadPerformance = (file?: File) => {
    if (!file) return;
    if (performanceVideo) URL.revokeObjectURL(performanceVideo);
    setPerformanceVideo(URL.createObjectURL(file));
    setPerformanceVideoName(file.name);
  };

  const youtubeEmbed = youtubeEmbedUrl(profile.youtube);

  return (
    <div data-no-edit style={{ width: "100%", height: "100%", overflow: "hidden", background: PAPER, color: INK, fontFamily: FONT }}>
      <style>{`.artist-profile-scroll::-webkit-scrollbar{display:none}.artist-visual:hover .artist-visual-action{opacity:1}`}</style>
      <div className="artist-profile-scroll" style={{ height: "100%", overflowY: "auto", scrollbarWidth: "none", paddingBottom: 112 }}>
        <section style={{ position: "relative", minHeight: 630, overflow: "hidden", background: INK, color: PAPER }}>
          {profile.cover ? (
            <img src={profile.cover} alt={`${profile.name} cover`} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
          ) : (
            <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", background: "radial-gradient(circle at 68% 22%, #514d19 0, #1c1b12 27%, #090909 70%)" }}>
              <span style={{ fontFamily: SERIF, fontSize: 112, letterSpacing: -9, color: "rgba(255,255,255,.055)" }}>LIVE</span>
            </div>
          )}
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(0,0,0,.58), rgba(0,0,0,.04) 44%, rgba(0,0,0,.86) 100%)" }} />

          <div style={{ position: "absolute", top: 22, left: 20, right: 20, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ fontFamily: SERIF, fontSize: 20 }}>getgigs <span style={{ marginLeft: 6, fontFamily: FONT, fontSize: 8, letterSpacing: 1.5, textTransform: "uppercase", opacity: .66 }}>artist profile</span></div>
            <button type="button" onClick={() => { setDraft(profile); setEditing((value) => !value); }} style={darkPill}>
              <Pencil size={13} /> {editing ? "Close" : "Customize"}
            </button>
          </div>

          <label style={{ ...darkPill, position: "absolute", top: 78, right: 20, cursor: "pointer" }}>
            <Camera size={13} /> {profile.cover ? "Change cover" : "Add cover photo"}
            <input type="file" accept="image/*" hidden onChange={(event) => void uploadCover(event.target.files?.[0])} />
          </label>

          {!profile.cover && (
            <label style={{ position: "absolute", inset: "180px 55px 205px", border: "1px dashed rgba(255,255,255,.42)", borderRadius: 24, display: "grid", placeItems: "center", cursor: "pointer" }}>
              <span style={{ display: "grid", justifyItems: "center", gap: 9, color: "rgba(255,255,255,.78)", fontSize: 10, letterSpacing: .5 }}><Upload size={22} strokeWidth={1.3} />A wide live photo, portrait, or artwork</span>
              <input type="file" accept="image/*" hidden onChange={(event) => void uploadCover(event.target.files?.[0])} />
            </label>
          )}

          <div style={{ position: "absolute", left: 24, right: 24, bottom: 26 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12, fontSize: 9, letterSpacing: 1.5, textTransform: "uppercase", color: CITRON }}><Music2 size={13} /> {profile.artistType || "Artist type"} · {profile.city || "Location"}</div>
            <span style={{ display: "block", marginBottom: 6, color: "rgba(255,255,255,.62)", fontSize: 8, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase" }}>Artist / band name</span>
            <button
              type="button"
              onClick={() => { setDraft(profile); setEditing(true); }}
              aria-label="Edit artist or band name"
              style={{ display: "block", width: "100%", maxWidth: 430, padding: 0, border: 0, background: "transparent", color: PAPER, textAlign: "left", cursor: "pointer", fontFamily: SERIF, fontSize: 50, fontWeight: 500, lineHeight: .92, letterSpacing: -2.8 }}
            >
              {profile.name.trim() || "Add your artist or band name"}
            </button>
            <p style={{ margin: "16px 0 0", paddingTop: 15, borderTop: "1px solid rgba(255,255,255,.25)", maxWidth: 405, fontSize: 10, lineHeight: 1.4, letterSpacing: .65, color: "rgba(255,255,255,.82)" }}>{profile.genres ? profile.genres.replaceAll(",", " ·") : "Add your genres"}</p>
          </div>
        </section>

        {editing && <EditProfile draft={draft} setDraft={setDraft} onSave={saveProfile} />}

        <section style={{ padding: "54px 20px 0" }}>
          <SectionHeading eyebrow="Make it feel like you" title="Visual journal" />
          <p style={{ margin: "10px 0 26px", maxWidth: 360, color: "rgba(0,0,0,.5)", fontSize: 11, lineHeight: 1.55 }}>Add live shots, press photos, artwork, or details from your world. These give venues a quick sense of your presence.</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 10 }}>
            {profile.visuals.map((visual, index) => (
              <VisualSlot key={index} visual={visual} index={index} featured={index === 0} onUpload={uploadVisual} />
            ))}
          </div>
        </section>

        <section style={{ padding: "64px 20px 0" }}>
          <SectionHeading eyebrow="Let venues see the room" title="Live performance" />
          <p style={{ margin: "10px 0 22px", maxWidth: 380, color: "rgba(0,0,0,.5)", fontSize: 11, lineHeight: 1.55 }}>Paste a YouTube performance link or upload a video directly from your device.</p>
          <div style={{ display: "flex", gap: 8, padding: 6, border: "1px solid rgba(0,0,0,.18)", borderRadius: 999, background: "#f3eee6" }}>
            <Link size={14} style={{ margin: "10px 0 0 8px", flex: "0 0 auto" }} />
            <input
              value={profile.youtube}
              onChange={(event) => persist({ ...profile, youtube: event.target.value })}
              placeholder="Paste a YouTube link"
              aria-label="YouTube performance link"
              style={{ minWidth: 0, flex: 1, border: 0, outline: 0, background: "transparent", fontFamily: FONT, fontSize: 10 }}
            />
          </div>
          <div style={{ marginTop: 12 }}>
            {youtubeEmbed ? (
              <iframe title="YouTube performance" src={youtubeEmbed} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen style={{ display: "block", width: "100%", aspectRatio: "16 / 9", border: 0, borderRadius: 18, background: INK }} />
            ) : performanceVideo ? (
              <video src={performanceVideo} controls playsInline style={{ display: "block", width: "100%", aspectRatio: "16 / 9", objectFit: "cover", borderRadius: 18, background: INK }} />
            ) : (
              <label
                onDragOver={(event) => event.preventDefault()}
                onDrop={(event) => { event.preventDefault(); uploadPerformance(event.dataTransfer.files?.[0]); }}
                style={{ height: 248, border: "1px dashed rgba(0,0,0,.3)", borderRadius: 18, display: "grid", placeItems: "center", background: "#eee9e0", cursor: "pointer" }}
              >
                <span style={{ display: "grid", justifyItems: "center", gap: 9, color: "rgba(0,0,0,.5)", fontSize: 9 }}><Play size={26} strokeWidth={1.2} />Drop or choose a performance video</span>
                <input type="file" accept="video/mp4,video/webm,video/quicktime" hidden onChange={(event) => uploadPerformance(event.target.files?.[0])} />
              </label>
            )}
          </div>
          <div style={{ marginTop: 10, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
            <span style={{ minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: "rgba(0,0,0,.45)", fontSize: 9 }}>{youtubeEmbed ? "Showing YouTube performance" : performanceVideoName || "MP4, WebM, or MOV"}</span>
            <label style={{ ...lightPill, flex: "0 0 auto" }}><Video size={13} />{performanceVideo ? "Replace video" : "Upload video"}<input type="file" accept="video/mp4,video/webm,video/quicktime" hidden onChange={(event) => uploadPerformance(event.target.files?.[0])} /></label>
          </div>
        </section>

        <section style={{ padding: "64px 20px 0" }}>
          <SectionHeading eyebrow="In your own words" title="Artist statement" />
          <p style={{ margin: "18px 0 0", fontFamily: SERIF, fontSize: 24, lineHeight: 1.35, letterSpacing: -.4, color: profile.bio ? INK : "rgba(0,0,0,.35)" }}>{profile.bio || "Add a short statement about your sound, your live show, and what makes your project yours."}</p>
        </section>

        <section style={{ padding: "64px 20px 0" }}>
          <SectionHeading eyebrow="The rooms that fit" title="Artist essentials" />
          <div style={{ marginTop: 22, borderTop: "1px solid rgba(0,0,0,.18)" }}>
            <InfoRow icon={<Music2 size={15} />} label="Sound" value={profile.genres || "—"} />
            <InfoRow icon={<Play size={15} />} label="Live setup" value={profile.performanceStyle || "—"} />
            <InfoRow icon={<MapPin size={15} />} label="Where" value={[profile.city, profile.travelRadius].filter(Boolean).join(" · ") || "—"} />
            <InfoRow icon={<Music2 size={15} />} label="Rooms" value={profile.preferredRooms || "—"} />
            <InfoRow icon={<Mail size={15} />} label="Booking" value={profile.bookingEmail || "—"} />
          </div>
        </section>

        <section style={{ margin: "64px 20px 30px", padding: "28px 22px", borderRadius: 22, background: CITRON }}>
          <span style={{ color: "rgba(0,0,0,.58)", fontSize: 8, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase" }}>This profile powers your matches</span>
          <h3 style={{ margin: "8px 0 10px", fontFamily: SERIF, fontSize: 29, fontWeight: 500, lineHeight: 1 }}>Better details. Better rooms.</h3>
          <p style={{ margin: 0, fontSize: 11, lineHeight: 1.55 }}>GetGigs uses your sound, location, audience, and show format to prioritize venues that make sense for where you are now.</p>
        </section>

        {saved && <div role="status" style={{ position: "fixed", left: "50%", bottom: 94, transform: "translateX(-50%)", zIndex: 1200, padding: "10px 14px", borderRadius: 999, display: "flex", alignItems: "center", gap: 7, background: INK, color: PAPER, fontSize: 11 }}><Check size={14} /> Profile saved</div>}
      </div>
    </div>
  );
}

function VisualSlot({ visual, index, featured, onUpload }: { visual: string; index: number; featured: boolean; onUpload: (index: number, file?: File) => void }) {
  return (
    <label className="artist-visual" style={{ position: "relative", gridColumn: featured ? "1 / -1" : undefined, height: featured ? 270 : 190, overflow: "hidden", borderRadius: 18, border: "1px solid rgba(0,0,0,.18)", background: visual ? INK : index % 2 ? "#e7e2d9" : "#f1ede5", cursor: "pointer" }}>
      {visual ? <img src={visual} alt={`Artist visual ${index + 1}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <span style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", color: "rgba(0,0,0,.42)" }}><span style={{ display: "grid", justifyItems: "center", gap: 8, fontSize: 9, letterSpacing: .5 }}><Upload size={20} strokeWidth={1.3} />Add visual {index + 1}</span></span>}
      <span className="artist-visual-action" style={{ position: "absolute", right: 10, bottom: 10, padding: "7px 10px", borderRadius: 999, background: "rgba(17,16,14,.82)", color: PAPER, fontSize: 8, opacity: visual ? .72 : 0, transition: "opacity .2s" }}>{visual ? "Replace" : "Upload"}</span>
      <input type="file" accept="image/*" hidden onChange={(event) => void onUpload(index, event.target.files?.[0])} />
    </label>
  );
}

function EditProfile({ draft, setDraft, onSave }: { draft: ArtistProfile; setDraft: (profile: ArtistProfile) => void; onSave: () => void }) {
  const field = (key: keyof ArtistProfile, label: string, multiline = false) => (
    <label style={{ display: "grid", gap: 6 }}>
      <span style={{ fontSize: 8, fontWeight: 700, letterSpacing: 1.1, textTransform: "uppercase", color: "rgba(0,0,0,.52)" }}>{label}</span>
      {multiline ? <textarea value={String(draft[key])} placeholder={`Enter ${label.toLowerCase()}`} onChange={(event) => setDraft({ ...draft, [key]: event.target.value })} rows={3} style={fieldStyle} /> : <input value={String(draft[key])} placeholder={`Enter ${label.toLowerCase()}`} onChange={(event) => setDraft({ ...draft, [key]: event.target.value })} style={fieldStyle} />}
    </label>
  );
  return (
    <section style={{ margin: "24px 20px 0", padding: 20, border: `1px solid ${INK}`, borderRadius: 22, background: PAPER }}>
      <SectionHeading eyebrow="Customize your public profile" title="Artist details" />
      <div style={{ marginTop: 20, display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 14 }}>
        {field("name", "Artist name")}{field("artistType", "Artist type")}{field("city", "Home city")}{field("genres", "Genres")}
        <div style={{ gridColumn: "1 / -1" }}>{field("bio", "Artist statement", true)}</div>
        {field("performanceStyle", "Live setup")}{field("preferredRooms", "Preferred rooms")}{field("travelRadius", "Travel radius")}
        <div style={{ gridColumn: "1 / -1" }}>{field("bookingEmail", "Booking email")}</div>
      </div>
      <button type="button" onClick={onSave} style={{ ...lightPill, width: "100%", minHeight: 44, justifyContent: "center", marginTop: 19, background: CITRON }}><Save size={14} /> Save artist profile</button>
    </section>
  );
}

function SectionHeading({ eyebrow, title }: { eyebrow: string; title: string }) { return <div><span style={{ color: GOLD, fontSize: 8, fontWeight: 700, letterSpacing: 1.6, textTransform: "uppercase" }}>{eyebrow}</span><h2 style={{ margin: "7px 0 0", fontFamily: SERIF, fontSize: 31, fontWeight: 500, lineHeight: 1 }}>{title}</h2></div>; }
function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) { return <div style={{ minHeight: 74, padding: "15px 2px", borderBottom: "1px solid rgba(0,0,0,.18)", display: "grid", gridTemplateColumns: "26px 82px minmax(0,1fr)", alignItems: "center", gap: 4 }}><span>{icon}</span><span style={{ color: "rgba(0,0,0,.46)", fontSize: 10 }}>{label}</span><strong style={{ fontFamily: SERIF, fontSize: 15, fontWeight: 500, textAlign: "right", lineHeight: 1.25 }}>{value}</strong></div>; }

async function compressImage(file: File, maxDimension: number, quality: number): Promise<string> {
  const source = await fileToDataUrl(file);
  const image = await loadImage(source);
  const scale = Math.min(1, maxDimension / Math.max(image.naturalWidth, image.naturalHeight));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
  canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
  canvas.getContext("2d")?.drawImage(image, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL("image/jpeg", quality);
}
function fileToDataUrl(file: File): Promise<string> { return new Promise((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(String(reader.result)); reader.onerror = reject; reader.readAsDataURL(file); }); }
function loadImage(src: string): Promise<HTMLImageElement> { return new Promise((resolve, reject) => { const image = new Image(); image.onload = () => resolve(image); image.onerror = reject; image.src = src; }); }

function youtubeEmbedUrl(value: string): string {
  if (!value.trim()) return "";
  try {
    const url = new URL(value.trim());
    let id = "";
    if (url.hostname.includes("youtu.be")) id = url.pathname.slice(1).split("/")[0];
    if (url.hostname.includes("youtube.com")) id = url.searchParams.get("v") || url.pathname.split("/").filter(Boolean).pop() || "";
    return id ? `https://www.youtube.com/embed/${encodeURIComponent(id)}` : "";
  } catch {
    return "";
  }
}

const darkPill: React.CSSProperties = { minHeight: 36, padding: "0 12px", border: "1px solid rgba(255,255,255,.45)", borderRadius: 999, display: "inline-flex", alignItems: "center", gap: 7, background: "rgba(0,0,0,.34)", color: PAPER, backdropFilter: "blur(12px)", fontFamily: FONT, fontSize: 9, cursor: "pointer" };
const lightPill: React.CSSProperties = { minHeight: 36, padding: "0 13px", border: `1px solid ${INK}`, borderRadius: 999, display: "inline-flex", alignItems: "center", gap: 7, background: PAPER, color: INK, fontFamily: FONT, fontSize: 10, fontWeight: 600, cursor: "pointer" };
const fieldStyle: React.CSSProperties = { width: "100%", minHeight: 42, boxSizing: "border-box", padding: "10px 11px", resize: "vertical", border: "1px solid rgba(0,0,0,.2)", borderRadius: 10, outline: 0, background: "#f5f0e8", color: INK, fontFamily: FONT, fontSize: 11 };
