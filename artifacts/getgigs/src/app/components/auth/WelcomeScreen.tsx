import { Building2, Compass, LogIn, Sparkles, UserPlus } from "lucide-react";

type Props = {
  onSignUp: () => void;
  onLogIn: () => void;
  onAdminLogin: () => void;
  onGuest: () => void;
  title?: string;
  description?: string;
};

export default function WelcomeScreen({ onSignUp, onLogIn, onAdminLogin, onGuest, title = "Find the right stage—or the right sound.", description = "Artists build one booking-ready profile and discover compatible rooms. Venues, promoters, and organizers discover artists ready to play." }: Props) {
  const titleParts = title.split(/(Get Gigs)/i);
  return (
    <main className="gg-welcome">
      <div className="gg-welcome-art" aria-hidden="true"><span>91%</span><span>87%</span><span>83%</span></div>
      <section className="gg-welcome-copy">
        <div className="gg-brand-mark"><Sparkles size={15}/> GetGigs</div>
        <p className="gg-kicker">Where independent artists and bookers meet</p>
        <h1>{titleParts.map((part, index) => /^Get Gigs$/i.test(part) ? <span className="gg-no-break" key={`${part}-${index}`}>{part}</span> : part)}</h1>
        <p>{description}</p>
        <div className="gg-welcome-actions gg-welcome-auth-actions">
          <button type="button" className="primary" onClick={onSignUp}><UserPlus size={15}/> Create account</button>
          <button type="button" onClick={onLogIn}><LogIn size={15}/> Log In</button>
          <button type="button" className="guest" onClick={onGuest}><Compass size={15}/> Explore as Guest</button>
        </div>
        <small>Explore without an account, save opportunities locally, and try a blank artist profile. Create an account when you want to keep your work across devices.</small>
        <button type="button" className="gg-admin-login-link" onClick={onAdminLogin}><Building2 size={12}/> Admin login</button>
      </section>
    </main>
  );
}
