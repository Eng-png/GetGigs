import { useMemo, useState } from "react";
import { ArrowLeft, Check, Copy, Eye, EyeOff, Send } from "lucide-react";
import type { BookingProfile } from "../../data/bookingProfile";
import type { Opportunity } from "../../data/opportunities";

const FONT = "'Google Sans Flex', 'Google Sans', Inter, sans-serif";
const SERIF = "'Nyght Serif', 'Iowan Old Style', 'Times New Roman', serif";
const PAPER = "#fdfaf6";
const INK = "#11100e";
const CITRON = "#e6e83c";
const GOLD = "#bd8e3c";

export default function GigApplicationScreen({
  opportunity,
  profile,
  onClose,
  demo = false,
}: {
  opportunity: Opportunity;
  profile: BookingProfile;
  onClose: () => void;
  demo?: boolean;
}) {
  const [reason, setReason] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [contactVisible, setContactVisible] = useState(false);
  const [copied, setCopied] = useState<"email" | "message" | null>(null);

  const applicationMessage = useMemo(
    () => [
      `Hi ${opportunity.bookingInfo.contactName},`,
      "",
      `I'd like to apply for the ${opportunity.opportunityTitle} at ${opportunity.venueName} on ${opportunity.date}.`,
      reason.trim(),
      message.trim(),
      "",
      `${profile.name} · ${profile.genre}`,
      `${profile.city}, ${profile.region.split(",")[0]}`,
      profile.bookingEmail,
    ].filter(Boolean).join("\n"),
    [message, opportunity, profile, reason],
  );

  const copy = async (kind: "email" | "message", value: string) => {
    await navigator.clipboard.writeText(value);
    setCopied(kind);
    window.setTimeout(() => setCopied(null), 1400);
  };

  if (submitted) {
    return (
      <div data-no-edit style={{ height: "100%", display: "grid", placeItems: "center", padding: 28, background: PAPER, color: INK, fontFamily: FONT, textAlign: "center" }}>
        <div>
          <div style={{ width: 68, height: 68, margin: "0 auto", borderRadius: "50%", display: "grid", placeItems: "center", background: CITRON }}><Check size={28}/></div>
          <h1 style={{ margin: "20px 0 10px", fontFamily: SERIF, fontSize: 36, fontWeight: 500 }}>Application ready.</h1>
          <p style={{ margin: "0 auto", maxWidth: 350, color: "rgba(0,0,0,.52)", fontSize: 11, lineHeight: 1.6 }}>Your booking profile and message are prepared for {opportunity.venueName}. {demo ? "Demo mode never sends a real email or submission." : "Sending is mocked for now; use the protected contact controls below to complete the submission."}</p>
          <button onClick={() => setContactVisible((value) => !value)} style={{ ...secondaryButton, marginTop: 20 }}>{contactVisible ? <EyeOff size={13}/> : <Eye size={13}/>} {contactVisible ? "Hide contact" : "Reveal contact"}</button>
          {contactVisible && (
            <div style={{ margin: "16px auto 0", maxWidth: 370, padding: 18, border: "1px solid rgba(0,0,0,.16)", borderRadius: 16, background: "#f3ede2", textAlign: "left", fontSize: 10, lineHeight: 1.6 }}>
              <strong style={{ display: "block", fontSize: 12 }}>{opportunity.bookingInfo.contactName}</strong>
              <span>{opportunity.bookingInfo.preferredContactMethod}</span><br />
              <a href={`mailto:${opportunity.bookingInfo.email}`} style={{ color: "#72520f" }}>{opportunity.bookingInfo.email}</a>
              {opportunity.bookingInfo.phone && <><br /><a href={`tel:${opportunity.bookingInfo.phone}`} style={{ color: "#72520f" }}>{opportunity.bookingInfo.phone}</a></>}
              <p style={{ margin: "10px 0 0" }}>{opportunity.bookingInfo.bookingInstructions}</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 14 }}>
                <button onClick={() => copy("email", opportunity.bookingInfo.email)} style={miniButton}><Copy size={12}/>{copied === "email" ? "Copied" : "Copy booking email"}</button>
                <button onClick={() => copy("message", applicationMessage)} style={miniButton}><Copy size={12}/>{copied === "message" ? "Copied" : "Copy application message"}</button>
              </div>
            </div>
          )}
          <button onClick={onClose} style={primaryButton}>Back to opportunity</button>
        </div>
      </div>
    );
  }

  const included = [
    ["Artist", profile.name],
    ["Genre", profile.genre],
    ["Location", `${profile.city}, ${profile.region.split(",")[0]}`],
    ["Expected Draw", profile.audienceDraw[0]?.estimate || "Not added"],
    ["Performance Format", profile.performanceFormats.join(" · ")],
    ["Set Length", profile.setLengths[1] || profile.setLengths[0]],
    ["Bio", "Included"],
    ["Music", `${profile.tracks.length} tracks included`],
    ["Featured Live Video", "Included"],
    ["EPK", "Included"],
    ["Technical Rider", "Included"],
    ["Availability", `Available for ${opportunity.date}`],
  ];

  return (
    <div data-no-edit style={{ width: "100%", height: "100%", overflowY: "auto", paddingBottom: 112, background: PAPER, color: INK, fontFamily: FONT }}>
      <header style={{ padding: "24px 20px 34px", background: CITRON }}>
        <button onClick={onClose} style={{ border: 0, background: "transparent", padding: 0, display: "flex", alignItems: "center", gap: 6, fontFamily: FONT, fontSize: 9, cursor: "pointer" }}><ArrowLeft size={15}/> Back to opportunity</button>
        <span style={{ display: "block", marginTop: 50, color: "rgba(0,0,0,.55)", fontSize: 8, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase" }}>Apply to</span>
        <h1 style={{ margin: "8px 0 0", fontFamily: SERIF, fontSize: "clamp(34px, 9vw, 48px)", fontWeight: 500, lineHeight: .98 }}>{opportunity.venueName}</h1>
        <p style={{ margin: "14px 0 0", fontSize: 10, lineHeight: 1.5 }}>{opportunity.opportunityTitle} · {opportunity.date}<br/>{opportunity.city}, {opportunity.state} · {opportunity.genre}</p>
      </header>

      <main style={{ width: "min(100%, 720px)", boxSizing: "border-box", margin: "0 auto", padding: "42px 20px" }}>
        <div style={{ padding: "13px 15px", borderRadius: 13, background: "#f3ede2", fontSize: 10, lineHeight: 1.45 }}><strong>Submission destination:</strong> this venue’s protected booking contact. Their email is not shown publicly on Explore.</div>
        <span style={{ display: "block", marginTop: 34, color: GOLD, fontSize: 8, fontWeight: 700, letterSpacing: 1.4, textTransform: "uppercase" }}>Pulled from your booking profile</span>
        <h2 style={{ margin: "7px 0 20px", fontFamily: SERIF, fontSize: 28, fontWeight: 500 }}>Profile information included</h2>
        <div style={{ borderTop: "1px solid rgba(0,0,0,.15)" }}>
          {included.map(([label,value]) => <div key={label} style={{ minHeight: 48, borderBottom: "1px solid rgba(0,0,0,.15)", display: "grid", gridTemplateColumns: "minmax(90px,1fr) minmax(0,1.2fr) 18px", alignItems: "center", gap: 8, fontSize: 9 }}><span style={{ color: "rgba(0,0,0,.5)" }}>{label}</span><strong style={{ textAlign: "right", fontWeight: 500, overflowWrap: "anywhere" }}>{value}</strong><Check size={12} color="#757b00"/></div>)}
        </div>

        <section style={{ marginTop: 48 }}>
          <span style={{ color: GOLD, fontSize: 8, fontWeight: 700, letterSpacing: 1.4, textTransform: "uppercase" }}>Only for this opportunity</span>
          <h2 style={{ margin: "7px 0 18px", fontFamily: SERIF, fontSize: 28, fontWeight: 500 }}>A note for the booker</h2>
          <label style={labelStyle}>Why are you interested in this show?<textarea rows={5} value={reason} onChange={event => setReason(event.target.value)} placeholder="Share why this room, bill, or audience feels like a fit." style={inputStyle}/></label>
          <label style={{ ...labelStyle, marginTop: 15 }}>Optional message<textarea rows={3} value={message} onChange={event => setMessage(event.target.value)} placeholder="Anything else the booker should know?" style={inputStyle}/></label>
          <button onClick={() => setSubmitted(true)} disabled={!reason.trim()} style={{ ...primaryButton, width: "100%", justifyContent: "center", opacity: reason.trim() ? 1 : .45 }}><Send size={14}/> Prepare Application</button>
        </section>
      </main>
    </div>
  );
}

const labelStyle: React.CSSProperties = { display: "grid", gap: 7, fontSize: 9, fontWeight: 600 };
const inputStyle: React.CSSProperties = { width: "100%", boxSizing: "border-box", padding: 12, border: "1px solid rgba(0,0,0,.18)", borderRadius: 13, background: "#f4efe7", color: INK, fontFamily: FONT, fontSize: 11, lineHeight: 1.5, resize: "vertical" };
const primaryButton: React.CSSProperties = { minHeight: 44, marginTop: 20, padding: "0 16px", border: `1px solid ${INK}`, borderRadius: 999, display: "inline-flex", alignItems: "center", gap: 7, background: CITRON, color: INK, fontFamily: FONT, fontSize: 10, fontWeight: 700, cursor: "pointer" };
const secondaryButton: React.CSSProperties = { minHeight: 40, padding: "0 14px", border: "1px solid rgba(0,0,0,.24)", borderRadius: 999, display: "inline-flex", alignItems: "center", gap: 7, background: PAPER, color: INK, fontFamily: FONT, fontSize: 10, fontWeight: 600, cursor: "pointer" };
const miniButton: React.CSSProperties = { minHeight: 34, padding: "0 11px", border: "1px solid rgba(0,0,0,.22)", borderRadius: 999, display: "inline-flex", alignItems: "center", gap: 6, background: PAPER, color: INK, fontFamily: FONT, fontSize: 9, cursor: "pointer" };
