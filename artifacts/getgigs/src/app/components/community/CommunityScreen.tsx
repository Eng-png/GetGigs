import { useState } from "react";
import { ArrowLeft, MapPin, Music2, Play, Users } from "lucide-react";

import deck1 from "../../../imports/deck-1.png";
import deck2 from "../../../imports/deck-2.png";
import deck3 from "../../../imports/deck-3.png";
import deck4 from "../../../imports/deck-4.png";

const FONT = "'Google Sans Flex', 'Google Sans', Inter, sans-serif";
const SERIF = "'Nyght Serif', 'Iowan Old Style', 'Times New Roman', serif";
const PAPER = "#fdfaf6";
const INK = "#11100e";
const CITRON = "#e6e83c";
const GOLD = "#bd8e3c";

type Artist = {
  id: string;
  name: string;
  type: string;
  city: string;
  genres: string[];
  image: string;
  bio: string;
  live: string;
  lookingFor: string;
};

const ARTISTS: Artist[] = [
  { id: "soft-static", name: "Soft Static", type: "Band", city: "Boston, MA", genres: ["Indie rock", "Dream pop"], image: deck1, bio: "Warm guitars, close harmonies, and patient songs made for rooms where the audience leans in.", live: "Four-piece band", lookingFor: "Listening rooms · Independent clubs" },
  { id: "nia-vale", name: "Nia Vale", type: "Solo artist", city: "Cambridge, MA", genres: ["R&B", "Alternative soul"], image: deck2, bio: "Intimate alternative soul carried by layered vocals, keys, and a quietly magnetic live set.", live: "Solo with keys · Trio available", lookingFor: "Intimate stages · Support slots" },
  { id: "paper-satellites", name: "Paper Satellites", type: "Band", city: "Providence, RI", genres: ["Indie pop", "Alternative"], image: deck3, bio: "Bright, restless indie pop with a live show that moves between sharp hooks and open-ended noise.", live: "Five-piece band", lookingFor: "Clubs · All-ages rooms" },
  { id: "mossline", name: "Mossline", type: "Duo", city: "Portland, ME", genres: ["Folk", "Ambient"], image: deck4, bio: "A quiet collision of fingerpicked guitar, field recordings, and two voices finding the same horizon.", live: "Acoustic duo", lookingFor: "Listening rooms · Art spaces" },
];

export default function CommunityScreen() {
  const [selected, setSelected] = useState<Artist | null>(null);
  return (
    <div data-no-edit style={{ width: "100%", height: "100%", overflow: "hidden", background: PAPER, color: INK, fontFamily: FONT }}>
      <style>{`.community-scroll::-webkit-scrollbar{display:none}`}</style>
      <div className="community-scroll" style={{ height: "100%", overflowY: "auto", scrollbarWidth: "none", paddingBottom: 112 }}>
        {selected ? <ArtistDetail artist={selected} onBack={() => setSelected(null)} /> : <CommunityIndex onSelect={setSelected} />}
      </div>
    </div>
  );
}

function CommunityIndex({ onSelect }: { onSelect: (artist: Artist) => void }) {
  return (
    <>
      <header style={{ padding: "58px 20px 26px" }}>
        <span style={{ color: GOLD, fontSize: 8, fontWeight: 700, letterSpacing: 1.7, textTransform: "uppercase" }}>Meet the people making the noise</span>
        <h1 style={{ margin: "9px 0 0", fontFamily: SERIF, fontSize: 42, fontWeight: 500, lineHeight: .95, letterSpacing: -2 }}>Community</h1>
        <p style={{ margin: "15px 0 0", maxWidth: 360, color: "rgba(0,0,0,.52)", fontSize: 11, lineHeight: 1.55 }}>Discover independent artists, see how they present their work, and find people building shows in nearby scenes.</p>
      </header>

      <section style={{ padding: "0 20px" }}>
        <button type="button" onClick={() => onSelect(ARTISTS[0])} style={{ position: "relative", width: "100%", height: 360, padding: 0, overflow: "hidden", border: 0, borderRadius: 22, background: INK, color: PAPER, textAlign: "left", cursor: "pointer" }}>
          <img src={ARTISTS[0].image} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          <span style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, transparent 30%, rgba(0,0,0,.86) 100%)" }} />
          <span style={{ position: "absolute", top: 15, left: 15, padding: "8px 11px", borderRadius: 999, background: CITRON, color: INK, fontSize: 8, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase" }}>Featured artist</span>
          <span style={{ position: "absolute", left: 18, right: 18, bottom: 18 }}>
            <strong style={{ display: "block", fontFamily: SERIF, fontSize: 34, fontWeight: 500, lineHeight: 1 }}>{ARTISTS[0].name}</strong>
            <span style={{ display: "block", marginTop: 8, color: "rgba(255,255,255,.78)", fontSize: 9 }}>{ARTISTS[0].type} · {ARTISTS[0].city}</span>
            <span style={{ display: "block", marginTop: 6, color: CITRON, fontSize: 9 }}>{ARTISTS[0].genres.join(" · ")}</span>
          </span>
        </button>
      </section>

      <section style={{ padding: "48px 20px 0" }}>
        <div style={{ display: "flex", alignItems: "end", justifyContent: "space-between", marginBottom: 18 }}>
          <div><span style={{ color: GOLD, fontSize: 8, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase" }}>Artist profiles</span><h2 style={{ margin: "6px 0 0", fontFamily: SERIF, fontSize: 28, fontWeight: 500 }}>Around the scene</h2></div>
          <span style={{ color: "rgba(0,0,0,.35)", fontSize: 9 }}>{ARTISTS.length} artists</span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 10 }}>
          {ARTISTS.slice(1).map((artist, index) => (
            <button key={artist.id} type="button" onClick={() => onSelect(artist)} style={{ gridColumn: index === 2 ? "1 / -1" : undefined, padding: 0, overflow: "hidden", border: "1px solid rgba(0,0,0,.15)", borderRadius: 17, background: PAPER, color: INK, textAlign: "left", cursor: "pointer" }}>
              <img src={artist.image} alt="" style={{ display: "block", width: "100%", height: index === 2 ? 210 : 165, objectFit: "cover" }} />
              <span style={{ display: "block", padding: 13 }}>
                <strong style={{ display: "block", fontFamily: SERIF, fontSize: 19, fontWeight: 500 }}>{artist.name}</strong>
                <span style={{ display: "block", marginTop: 5, color: "rgba(0,0,0,.5)", fontSize: 8 }}>{artist.city}</span>
                <span style={{ display: "block", marginTop: 6, color: GOLD, fontSize: 8 }}>{artist.genres.join(" · ")}</span>
              </span>
            </button>
          ))}
        </div>
      </section>
    </>
  );
}

function ArtistDetail({ artist, onBack }: { artist: Artist; onBack: () => void }) {
  return (
    <>
      <section style={{ position: "relative", height: 560, overflow: "hidden", background: INK, color: PAPER }}>
        <img src={artist.image} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(0,0,0,.44), transparent 42%, rgba(0,0,0,.88))" }} />
        <button type="button" onClick={onBack} aria-label="Back to community" style={{ position: "absolute", top: 22, left: 20, width: 38, height: 38, border: "1px solid rgba(255,255,255,.45)", borderRadius: "50%", display: "grid", placeItems: "center", background: "rgba(0,0,0,.3)", color: PAPER, cursor: "pointer" }}><ArrowLeft size={17} /></button>
        <div style={{ position: "absolute", left: 22, right: 22, bottom: 25 }}>
          <span style={{ color: CITRON, fontSize: 8, fontWeight: 700, letterSpacing: 1.4, textTransform: "uppercase" }}>{artist.type} · {artist.city}</span>
          <h1 style={{ margin: "8px 0 0", fontFamily: SERIF, fontSize: 46, fontWeight: 500, lineHeight: .95, letterSpacing: -2 }}>{artist.name}</h1>
          <p style={{ margin: "13px 0 0", color: "rgba(255,255,255,.78)", fontSize: 9 }}>{artist.genres.join(" · ")}</p>
        </div>
      </section>

      <section style={{ padding: "48px 20px 0" }}>
        <span style={{ color: GOLD, fontSize: 8, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase" }}>About the artist</span>
        <p style={{ margin: "12px 0 0", fontFamily: SERIF, fontSize: 25, lineHeight: 1.35 }}>{artist.bio}</p>
      </section>

      <section style={{ padding: "48px 20px 20px" }}>
        <h2 style={{ margin: "0 0 18px", fontFamily: SERIF, fontSize: 29, fontWeight: 500 }}>Artist details</h2>
        <div style={{ borderTop: "1px solid rgba(0,0,0,.18)" }}>
          <DetailRow icon={<Play size={15} />} label="Live setup" value={artist.live} />
          <DetailRow icon={<MapPin size={15} />} label="Based in" value={artist.city} />
          <DetailRow icon={<Users size={15} />} label="Looking for" value={artist.lookingFor} />
          <DetailRow icon={<Music2 size={15} />} label="Sound" value={artist.genres.join(" · ")} />
        </div>
      </section>
    </>
  );
}

function DetailRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return <div style={{ minHeight: 70, padding: "13px 2px", borderBottom: "1px solid rgba(0,0,0,.18)", display: "grid", gridTemplateColumns: "26px 82px minmax(0,1fr)", alignItems: "center" }}><span>{icon}</span><span style={{ color: "rgba(0,0,0,.45)", fontSize: 9 }}>{label}</span><strong style={{ fontFamily: SERIF, fontSize: 14, fontWeight: 500, textAlign: "right" }}>{value}</strong></div>;
}
