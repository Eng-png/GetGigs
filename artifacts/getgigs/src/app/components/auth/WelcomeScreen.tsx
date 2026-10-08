import { ArrowRight, Play, Sparkles } from "lucide-react";

export default function WelcomeScreen({ onSignUp, onLogIn, onGuest, onDemo }: { onSignUp: () => void; onLogIn: () => void; onGuest: () => void; onDemo: () => void }) {
  return (
    <main className="gg-welcome">
      <div className="gg-welcome-art" aria-hidden="true"><span>91%</span><span>87%</span><span>83%</span></div>
      <section className="gg-welcome-copy">
        <div className="gg-brand-mark"><Sparkles size={15}/> GetGigs</div>
        <p className="gg-kicker">Artist-first booking discovery</p>
        <h1>Find venues that fit your sound.</h1>
        <p>Build one booking-ready artist profile, discover compatible rooms, and keep every opportunity in one place.</p>
        <div className="gg-welcome-actions">
          <button type="button" className="primary" onClick={onSignUp}>Sign Up <ArrowRight size={16}/></button>
          <button type="button" onClick={onLogIn}>Log In</button>
          <button type="button" onClick={onGuest}>Continue as Guest</button>
          <button type="button" className="demo" onClick={onDemo}><Play size={15} fill="currentColor"/> View Demo</button>
        </div>
        <small>Demo and sample venue contacts are clearly marked and never send real submissions.</small>
      </section>
    </main>
  );
}
