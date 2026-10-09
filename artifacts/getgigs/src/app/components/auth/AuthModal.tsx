import { AlertCircle, ArrowLeft, CheckCircle2, Eye, EyeOff, X } from "lucide-react";
import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import type { AppRole } from "../../lib/authTypes";

export type AuthMode = "login" | "signup" | "forgot";

type Props = {
  mode: AuthMode;
  signupRole?: Exclude<AppRole, "admin">;
  locked?: boolean;
  onClose: () => void;
  onAuthenticated: () => void;
  onSwitch: (mode: AuthMode, role?: Exclude<AppRole, "admin">) => void;
};

export default function AuthModal({ mode, signupRole = "artist", locked, onClose, onAuthenticated, onSwitch }: Props) {
  const { configured, signIn, signUp, sendPasswordReset } = useAuth();
  const [role, setRole] = useState<Exclude<AppRole, "admin">>(signupRole);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setSuccess("");
    if (!configured) {
      setError("Authentication is ready in the app, but the Supabase project keys still need to be added.");
      return;
    }
    if (!email.trim()) return setError("Enter your email address.");
    setBusy(true);
    try {
      if (mode === "forgot") {
        await sendPasswordReset(email.trim());
        setSuccess("Password reset link sent. Check your email.");
      } else if (mode === "login") {
        await signIn(email.trim(), password);
        onAuthenticated();
      } else {
        if (!name.trim()) throw new Error(role === "artist" ? "Enter your artist or band name." : "Enter your name or organization name.");
        if (password.length < 8) throw new Error("Use at least 8 characters for your password.");
        if (password !== confirmPassword) throw new Error("The passwords do not match.");
        const result = await signUp({ email: email.trim(), password, displayName: name.trim(), role });
        if (result.needsEmailConfirmation) setSuccess("Account created. Confirm your email, then log in to GetGigs.");
        else onAuthenticated();
      }
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "We could not complete that request. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  const title = mode === "forgot" ? "Reset your password" : mode === "signup" ? "Create your GetGigs account" : "Log in to GetGigs";
  return (
    <div className="gg-modal-layer" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget && !locked) onClose(); }}>
      <section className="gg-auth-modal" role="dialog" aria-modal="true" aria-labelledby="auth-title">
        <button type="button" className="gg-modal-close" onClick={onClose} aria-label="Close"><X size={18}/></button>
        {mode === "forgot" && <button type="button" className="gg-auth-back" onClick={() => onSwitch("login")}><ArrowLeft size={14}/> Log in</button>}
        <p className="gg-kicker">{locked ? "Account required" : "Welcome to GetGigs"}</p>
        <h2 id="auth-title">{title}</h2>
        <p>{locked ? "Create an account or log in to use this feature." : mode === "forgot" ? "We’ll email you a secure link to choose a new password." : "Your account, profile, and saved items stay with you across devices."}</p>

        <form onSubmit={submit}>
          {mode === "signup" && <>
            <fieldset className="gg-role-choice">
              <legend>What brings you to GetGigs?</legend>
              <button type="button" className={role === "artist" ? "active" : ""} onClick={() => setRole("artist")}><strong>I’m an Artist</strong><span>Find gigs and build a booking profile</span></button>
              <button type="button" className={role === "booker" ? "active" : ""} onClick={() => setRole("booker")}><strong>I’m Looking for Artists</strong><span>Discover talent and post opportunities</span></button>
            </fieldset>
            <label>{role === "artist" ? "Artist or band name" : "Your name or organization"}<input autoComplete="name" value={name} onChange={(event) => setName(event.target.value)} placeholder={role === "artist" ? "Your artist name" : "Your organization"}/></label>
          </>}
          <label>Email<input type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com"/></label>
          {mode !== "forgot" && <label>Password<span className="gg-password-field"><input type={showPassword ? "text" : "password"} autoComplete={mode === "login" ? "current-password" : "new-password"} value={password} onChange={(event) => setPassword(event.target.value)} placeholder="At least 8 characters"/><button type="button" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? "Hide password" : "Show password"}>{showPassword ? <EyeOff size={16}/> : <Eye size={16}/>}</button></span></label>}
          {mode === "signup" && <label>Confirm password<input type="password" autoComplete="new-password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} placeholder="Repeat your password"/></label>}

          {error && <div className="gg-auth-message error" role="alert"><AlertCircle size={15}/><span>{error}</span></div>}
          {success && <div className="gg-auth-message success" role="status"><CheckCircle2 size={15}/><span>{success}</span></div>}
          <button type="submit" className="gg-auth-primary" disabled={busy || Boolean(success)}>{busy ? "Please wait…" : mode === "signup" ? `Create ${role === "artist" ? "Artist" : "Booker"} account` : mode === "forgot" ? "Send reset link" : "Log in"}</button>
        </form>

        {mode === "login" && <button type="button" className="gg-auth-later" onClick={() => onSwitch("forgot")}>Forgot password?</button>}
        {mode !== "forgot" && <button type="button" className="gg-auth-secondary" onClick={() => onSwitch(mode === "login" ? "signup" : "login", role)}>{mode === "login" ? "Need an account? Sign Up" : "Already have an account? Log In"}</button>}
        {locked && <button type="button" className="gg-auth-later" onClick={onClose}>Maybe Later</button>}
        <small className="gg-auth-security">Passwords are handled securely by Supabase Auth and are never stored in the GetGigs profile database.</small>
      </section>
    </div>
  );
}
