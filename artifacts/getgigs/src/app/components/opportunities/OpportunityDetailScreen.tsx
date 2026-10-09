import { Bookmark, ExternalLink, Lock, Mail, Share2 } from "lucide-react";
import type { Opportunity } from "../../data/opportunities";
import SafeImage from "../shared/SafeImage";

const FONT = "'Google Sans Flex', 'Google Sans', Inter, sans-serif";
const SERIF = "'Besley', 'Nyght Serif', 'Iowan Old Style', serif";
const PAPER = "#fdfaf6";
const GOLD = "#bd8e3c";

export default function OpportunityDetailScreen({ opportunity, saved, accessMode = "guest", onBack, onApply, onToggleSaved, onRequireAuth }: { opportunity: Opportunity; saved: boolean; accessMode?: "guest" | "authenticated" | "demo"; onBack: () => void; onApply: (opportunity: Opportunity) => void; onToggleSaved: (opportunityId: string) => void; onRequireAuth?: () => void }) {
  const canSeePrivate = accessMode !== "guest";
  const info = opportunity.publicInfo;
  const booking = opportunity.bookingInfo;
  const requirements = opportunity.requirements;

  const share = async () => {
    const text = `${opportunity.venueName} — ${opportunity.opportunityTitle}, ${opportunity.date}`;
    try { if (navigator.share) await navigator.share({ title: opportunity.venueName, text }); else await navigator.clipboard.writeText(text); } catch { /* Native share cancellation. */ }
  };

  return (
    <div data-no-edit style={{ width: "100%", height: "100%", overflowY: "auto", paddingBottom: 116, background: PAPER, color: "#11100e", fontFamily: FONT }}>
      <div style={{ position: "relative", minHeight: "min(62vh, 520px)" }}>
        <SafeImage src={info.coverImage} alt={opportunity.venueName} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}/>
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(0,0,0,.35), rgba(0,0,0,.04) 45%, rgba(0,0,0,.82))" }} />
        <button type="button" onClick={onBack} style={backButton}>← Back</button>
        <div style={{ position: "absolute", left: 20, right: 20, bottom: 26, color: "#fff" }}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}><span style={tag}>{opportunity.matchScore}% Match</span>{opportunity.dataQuality.isDemo && <span style={{ ...tag, background: "rgba(255,255,255,.88)" }}>Sample data</span>}</div>
          <h1 style={{ margin: "14px 0 4px", fontFamily: SERIF, fontSize: "clamp(35px, 9vw, 58px)", fontWeight: 500, lineHeight: .96 }}>{opportunity.venueName}</h1>
          <p style={{ margin: "12px 0 0", fontSize: 11, lineHeight: 1.5 }}>{info.city}, {info.state} · {info.venueType}<br />{opportunity.opportunityTitle} · {opportunity.date}</p>
        </div>
      </div>

      <main style={{ width: "min(100%, 760px)", boxSizing: "border-box", margin: "0 auto", padding: "38px 20px 20px" }}>
        {accessMode === "demo" && <div className="gg-demo-inline"><strong>Demo venue</strong><span>Explore the match, requirements, and protected sample booking workflow. Nothing is submitted.</span></div>}
        <span style={eyebrow}>Venue</span>
        <h2 style={title}>{opportunity.opportunityTitle}</h2>
        <div style={{ borderTop: "1px solid rgba(0,0,0,.15)" }}>
          <DetailRow label="Location" value={[info.address, info.city, info.state, info.zip].filter(Boolean).join(", ")} />
          <DetailRow label="Capacity" value={info.capacity || "Ask venue"} />
          <DetailRow label="Genres" value={opportunity.genre} />
          <DetailRow label="Compensation" value={opportunity.compensationSummary} />
          <DetailRow label="Expected draw" value={opportunity.expectedDraw} />
        </div>
        <p style={body}>{info.description}</p>

        <div className="gg-detail-actions">
          <button type="button" onClick={() => canSeePrivate ? onApply(opportunity) : onRequireAuth?.()} className="primary"><Mail size={14}/> Contact venue / Prepare booking</button>
          <button type="button" aria-pressed={saved} onClick={() => onToggleSaved(opportunity.id)}><Bookmark size={14} fill={saved ? "currentColor" : "none"}/>{saved ? "Saved" : "Save venue"}</button>
          <button type="button" aria-label="Share venue" onClick={share}><Share2 size={14}/></button>
        </div>

        {info.gallery.length > 0 && <section className="gg-detail-section"><span style={eyebrow}>Venue gallery</span><div className="gg-gallery-grid">{info.gallery.map((src, index) => <SafeImage key={`${src}-${index}`} src={src} alt={`${info.venueName} gallery ${index + 1}`} />)}</div></section>}

        <section className="gg-detail-section"><span style={eyebrow}>Why it matches</span><h2 style={sectionTitle}>A room aligned with your sound.</h2><p style={body}>{opportunity.matching.whyItMatches}</p><div className="gg-fact-grid"><Fact label="Venue vibe" value={opportunity.matching.venueVibe}/><Fact label="Typical artists" value={opportunity.matching.typicalArtists}/><Fact label="Emerging artists" value={opportunity.matching.emergingArtistsAccepted ? "Accepted" : "Not currently listed"}/><Fact label="Support slots" value={opportunity.matching.supportSlotsAvailable ? "Available" : "Not currently listed"}/></div></section>

        <section className="gg-detail-section"><span style={eyebrow}>Requirements</span><h2 style={sectionTitle}>What to prepare.</h2><div className="gg-requirement-list"><DetailRow label="Set length" value={requirements.typicalSetLength}/><DetailRow label="Age policy" value={requirements.ageRequirement}/><DetailRow label="Draw" value={requirements.drawRequirement}/><DetailRow label="Payment model" value={requirements.paymentModel}/><DetailRow label="Typical guarantee" value={requirements.typicalGuarantee}/><DetailRow label="Equipment / backline" value={requirements.equipment}/><DetailRow label="Submission materials" value={requirements.requiredMaterials}/></div></section>

        <section className="gg-booking-panel">
          <span style={eyebrow}>Booking</span>
          {canSeePrivate ? <>
            <h2 style={sectionTitle}>Booking information</h2>
            <div className="gg-private-label">Private booking contact · visible only to authenticated artists</div>
            <div className="gg-fact-grid"><Fact label="Contact" value={booking.contactName || "Not listed"}/><Fact label="Method" value={booking.preferredContactMethod || "Not listed"}/><Fact label="Email" value={booking.email || "Not listed"}/><Fact label="Phone" value={booking.phone || "Not listed"}/></div>
            <p style={body}>{booking.bookingInstructions}</p>
            <div className="gg-link-row">{info.website && <a href={info.website} target="_blank" rel="noreferrer">Visit website <ExternalLink size={12}/></a>}{info.bookingPage && <a href={info.bookingPage} target="_blank" rel="noreferrer">Booking page <ExternalLink size={12}/></a>}{booking.submissionLink && <a href={booking.submissionLink} target="_blank" rel="noreferrer">Submission link <ExternalLink size={12}/></a>}</div>
            {accessMode === "demo" && <p className="gg-safety-note">These are mock contacts. Demo mode never sends a real email or form.</p>}
          </> : <div className="gg-locked-content"><Lock size={24}/><h2>Sign in to unlock booking contacts</h2><p>Create a free artist profile to view booking email, phone, submission links, and private venue notes.</p><button type="button" onClick={onRequireAuth}>Log in or sign up</button></div>}
        </section>

        <section className="gg-detail-section"><span style={eyebrow}>Notes</span><p style={body}>{canSeePrivate ? booking.internalNotes : "Additional private venue notes are available to authenticated artists."}</p><small>Last verified: {opportunity.dataQuality.lastVerifiedDate} · {opportunity.dataQuality.verificationStatus}</small></section>
      </main>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) { return <div style={{ minHeight: 48, display: "grid", gridTemplateColumns: "minmax(110px,.7fr) 1.3fr", alignItems: "center", gap: 16, borderBottom: "1px solid rgba(0,0,0,.15)", fontSize: 10 }}><span style={{ color: "rgba(0,0,0,.48)" }}>{label}</span><strong style={{ fontWeight: 500 }}>{value || "Not listed"}</strong></div>; }
function Fact({ label, value }: { label: string; value: string }) { return <div><span>{label}</span><strong>{value || "Not listed"}</strong></div>; }

const eyebrow: React.CSSProperties = { color: GOLD, fontSize: 8, fontWeight: 700, letterSpacing: 1.45, textTransform: "uppercase" };
const title: React.CSSProperties = { margin: "8px 0 22px", fontFamily: SERIF, fontSize: 30, fontWeight: 500 };
const sectionTitle: React.CSSProperties = { margin: "8px 0 12px", fontFamily: SERIF, fontSize: 25, fontWeight: 500 };
const body: React.CSSProperties = { margin: "18px 0 0", maxWidth: 640, color: "rgba(0,0,0,.65)", fontFamily: SERIF, fontSize: 16, lineHeight: 1.65 };
const tag: React.CSSProperties = { display: "inline-block", padding: "6px 9px", borderRadius: 999, background: "#ddd864", color: "#000", fontSize: 11 };
const backButton: React.CSSProperties = { position: "absolute", zIndex: 2, top: 24, left: 20, minHeight: 38, padding: "0 14px", border: "1px solid rgba(255,255,255,.7)", borderRadius: 999, background: "rgba(20,20,18,.28)", color: "#fff", fontFamily: FONT, fontSize: 10, cursor: "pointer", backdropFilter: "blur(8px)" };
