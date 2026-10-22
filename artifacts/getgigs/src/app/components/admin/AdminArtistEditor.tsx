import { useEffect, useState } from "react";
import type { BookingProfile } from "../../data/bookingProfile";
import { loadAdminArtistProfile, updateAdminArtist } from "../../lib/getgigsData";
import ImageUploader from "../shared/ImageUploader";

export default function AdminArtistEditor({ userId, actorId, artistName, onClose, onSaved }: { userId: string; actorId: string; artistName: string; onClose: () => void; onSaved: () => void }) {
  const [profile, setProfile] = useState<BookingProfile | null>(null);
  const [json, setJson] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    void loadAdminArtistProfile(userId).then((value) => { setProfile(value); setJson(JSON.stringify(value, null, 2)); }).catch((caught) => setError(caught instanceof Error ? caught.message : "Could not load artist profile."));
  }, [userId]);

  const save = async () => {
    setError("");
    try {
      const next = JSON.parse(json) as BookingProfile;
      if (!next || typeof next !== "object" || typeof next.name !== "string") throw new Error("Profile JSON must include a name.");
      setBusy(true);
      await updateAdminArtist(userId, next, actorId);
      onSaved();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not save artist profile.");
    } finally {
      setBusy(false);
    }
  };

  return <div className="gg-admin-editor-panel">
    <div className="gg-role-title"><span className="gg-kicker">Administrator editing</span><h2>{artistName || "Artist profile"}</h2><p>Update profile fields, match inputs, contact details, and image URLs. Changes are saved to the artist profile and public directory.</p></div>
    {profile ? <><div className="gg-admin-media-grid"><ImageUploader label="Artist photo" value={profile.image} maxMb={10} minimum={{ width: 800 }} recommendation="Square or portrait image recommended" onChange={(value) => { const next = { ...profile, image: value }; setProfile(next); setJson(JSON.stringify(next, null, 2)); }}/><ImageUploader label="Artist cover photo" value={profile.bandImage} maxMb={10} minimum={{ width: 1200 }} recommendation="Wide image recommended" onChange={(value) => { const next = { ...profile, bandImage: value }; setProfile(next); setJson(JSON.stringify(next, null, 2)); }}/></div><textarea className="gg-admin-json-editor" value={json} onChange={(event) => setJson(event.target.value)} spellCheck={false} aria-label="Artist profile JSON"/></> : <p>Loading artist profile…</p>}
    {error && <p className="gg-field-error" role="alert">{error}</p>}
    <div className="gg-form-submit"><button type="button" onClick={onClose}>Cancel</button><button type="button" className="primary" onClick={() => void save()} disabled={busy || !profile}>{busy ? "Saving…" : "Save artist"}</button></div>
  </div>;
}
