import { ArrowRight, Building2, LogIn, Music2, Play, Sparkles } from "lucide-react";

type Props = {
  onSignUpArtist: () => void;
  onSignUpBooker: () => void;
  onLogIn: () => void;
  onGuest: () => void;
  onDemo: () => void;
};

export default function WelcomeScreen({ onSignUpArtist, onSignUpBooker, onLogIn, onGuest, onDemo }: Props) {
  return (
    <main className="gg-welcome">
      <div className="gg-welcome-art" aria-hidden="true"><span>91%</span><span>87%</span><span>83%</span></div>
      <section className="gg-welcome-copy">
        <div className="gg-brand-mark"><Sparkles size={15}/> GetGigs</div>
        <p className="gg-kicker">Where independent artists and bookers meet</p>
        <h1>Find the right stage—or the right sound.</h1>
        <p>Artists build one booking-ready profile and discover compatible rooms. Venues, promoters, and organizers discover artists ready to play.</p>
        <div className="gg-welcome-actions gg-welcome-auth-actions">
          <button type="button" className="primary" onClick={onSignUpArtist}><Music2 size={15}/> Sign up as Artist <ArrowRight size={14}/></button>
          <button type="button" className="primary booker" onClick={onSignUpBooker}><Building2 size={15}/> Sign up as Looking for Artist</button>
          <button type="button" onClick={onLogIn}><LogIn size={15}/> Log In</button>
          <button type="button" onClick={onGuest}>Take a Look as Guest</button>
          <button type="button" className="demo" onClick={onDemo}><Play size={15} fill="currentColor"/> Demo</button>
        </div>
        <small>Guest browsing is open. Saving, contacting, posting, and private booking details require an account.</small>
      </section>
    </main>
  );
}
