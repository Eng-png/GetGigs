import { X } from "lucide-react";
import { useState } from "react";

export default function AuthModal({ mode, locked, onClose, onAuthenticated, onSwitch }: { mode: "login" | "signup"; locked?: boolean; onClose: () => void; onAuthenticated: () => void; onSwitch: (mode: "login" | "signup") => void }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  return (
    <div className="gg-modal-layer" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section className="gg-auth-modal" role="dialog" aria-modal="true" aria-labelledby="auth-title">
        <button type="button" className="gg-modal-close" onClick={onClose} aria-label="Close"><X size={18}/></button>
        <p className="gg-kicker">{locked ? "Booking contacts are protected" : "Welcome to GetGigs"}</p>
        <h2 id="auth-title">{locked ? "Log in to view booking information" : mode === "signup" ? "Create your artist profile" : "Log in to GetGigs"}</h2>
        <p>{locked ? "Create a free GetGigs profile to access venue booking details and keep your artist information ready for applications." : "This prototype keeps your session on this device. No password or real submission is required."}</p>
        {mode === "signup" && <label>Artist or band name<input value={name} onChange={(event) => setName(event.target.value)} placeholder="Your artist name"/></label>}
        <label>Email<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="artist@example.com"/></label>
        <button type="button" className="gg-auth-primary" onClick={onAuthenticated}>{mode === "signup" ? "Create profile" : "Log in"}</button>
        <button type="button" className="gg-auth-secondary" onClick={() => onSwitch(mode === "login" ? "signup" : "login")}>{mode === "login" ? "Need an account? Sign Up" : "Already have an account? Log In"}</button>
        {locked && <button type="button" className="gg-auth-later" onClick={onClose}>Maybe Later</button>}
      </section>
    </div>
  );
}
