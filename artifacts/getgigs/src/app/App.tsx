import { useEffect, useMemo, useState } from "react";
import { Bookmark, Compass, LogOut, Settings, UserRound, UsersRound } from "lucide-react";
import Version1Screen from "./components/v1/Version1Screen";
import Version2Screen from "./components/v2/Version2Screen";
import CommunityScreen from "./components/community/CommunityScreen";
import ArtistBookingProfileScreen from "./components/profile/ArtistBookingProfileScreen";
import GigApplicationScreen from "./components/application/GigApplicationScreen";
import WelcomeScreen from "./components/auth/WelcomeScreen";
import AuthModal, { type AuthMode } from "./components/auth/AuthModal";
import DemoCoach from "./components/auth/DemoCoach";
import BookerDashboard from "./components/booker/BookerDashboard";
import AdminDashboard from "./components/admin/AdminDashboard";
import { useAuth } from "./context/AuthContext";
import type { AppRole } from "./lib/authTypes";
import { EMPTY_PROFILE, MAYA_PROFILE, type BookingProfile } from "./data/bookingProfile";
import { OPPORTUNITIES, type Opportunity } from "./data/opportunities";
import { loadArtistProfile, loadPublishedVenues, loadSavedVenueIds, recordSearch, saveArtistProfile, setVenueSaved, syncRealVenues, uploadPrivateDocument } from "./lib/getgigsData";

type Section = "explore" | "saved" | "profile" | "community";
type VisitorMode = "guest" | "demo";
type ScreenAccessMode = "guest" | "authenticated" | "demo";
type AuthDialog = { mode: AuthMode; role?: Exclude<AppRole, "admin">; locked: boolean };

const NAV_ITEMS = [
  { id: "explore" as const, label: "Explore", icon: Compass },
  { id: "saved" as const, label: "Saved", icon: Bookmark },
  { id: "profile" as const, label: "Profile", icon: UserRound },
  { id: "community" as const, label: "Community", icon: UsersRound },
];

export default function App() {
  const { configured, loading: authLoading, session, profile: account, signOut, updatePassword, refreshProfile } = useAuth();
  const [visitorMode, setVisitorMode] = useState<VisitorMode | null>(() => {
    const value = window.localStorage.getItem("getgigs-visitor-mode-v1");
    return value === "guest" || value === "demo" ? value : null;
  });
  const [section, setSection] = useState<Section>(() => visitorModeFromStorage() === "demo" ? "profile" : "explore");
  const [auth, setAuth] = useState<AuthDialog | null>(() => requestedRoleFromPath() ? { mode: "login", locked: true } : null);
  const [demoStep, setDemoStep] = useState(() => Number(window.localStorage.getItem("getgigs-demo-step-v1") || 0));
  const [applying, setApplying] = useState<Opportunity | null>(null);
  const [savedOpportunityIds, setSavedOpportunityIds] = useState<Set<string>>(new Set());
  const [venues, setVenues] = useState<Opportunity[]>(OPPORTUNITIES);
  const [bookingProfile, setBookingProfile] = useState<BookingProfile>(EMPTY_PROFILE);
  const [demoProfile, setDemoProfile] = useState(MAYA_PROFILE);
  const [accountMenu, setAccountMenu] = useState(false);
  const [dataNotice, setDataNotice] = useState("");
  const requestedRole = useMemo(() => requestedRoleFromPath(), []);

  const accessMode: ScreenAccessMode | null = session ? "authenticated" : visitorMode;

  useEffect(() => {
    window.localStorage.removeItem("getgigs-access-mode-v1");
    if (!configured) return;
    loadPublishedVenues(account?.role === "artist" || account?.role === "admin").then((real) => setVenues([...OPPORTUNITIES, ...real.filter((venue) => !OPPORTUNITIES.some((sample) => sample.id === venue.id))])).catch(() => undefined);
  }, [configured, account?.role]);

  useEffect(() => {
    if (!session || account?.role !== "artist") return;
    Promise.all([loadArtistProfile(session.user.id), loadSavedVenueIds(session.user.id)])
      .then(([artistProfile, saved]) => { setBookingProfile(artistProfile); setSavedOpportunityIds(new Set(saved)); })
      .catch((error) => setDataNotice(error instanceof Error ? error.message : "Could not restore your artist data."));
  }, [session?.user.id, account?.role]);

  useEffect(() => {
    if (!account) return;
    const route = account.role === "admin" ? "/admin" : account.role === "booker" ? "/booker/discover" : `/artist/${section}`;
    if (!requestedRole || account.role === requestedRole) window.history.replaceState({}, "", route);
  }, [account?.role, section, requestedRole]);

  const enterVisitor = (mode: VisitorMode) => {
    setVisitorMode(mode);
    window.localStorage.setItem("getgigs-visitor-mode-v1", mode);
    setSection(mode === "demo" ? "profile" : "explore");
    if (mode === "demo") { setDemoStep(0); window.localStorage.setItem("getgigs-demo-step-v1", "0"); }
    window.history.replaceState({}, "", "/");
  };
  const updateBookingProfile = async (next: BookingProfile) => {
    if (visitorMode === "demo") { setDemoProfile(next); return; }
    if (!session) return requireAuth();
    try {
      const saved = await saveArtistProfile(session.user.id, next);
      setBookingProfile(saved);
      await refreshProfile();
      setDataNotice("Profile saved to your account.");
    } catch (error) { setDataNotice(error instanceof Error ? error.message : "Could not save your profile."); throw error; }
  };
  const updateVenues = (next: Opportunity[]) => {
    const previous = venues;
    setVenues(next);
    if (account?.role === "admin") void syncRealVenues(previous, next).catch((error) => { setVenues(previous); setDataNotice(error instanceof Error ? error.message : "Could not update venues."); });
  };
  const toggleSavedOpportunity = (id: string) => {
    if (visitorMode === "guest") return requireAuth();
    const nextSaved = !savedOpportunityIds.has(id);
    setSavedOpportunityIds((current) => { const next = new Set(current); nextSaved ? next.add(id) : next.delete(id); return next; });
    if (session) void setVenueSaved(session.user.id, id, nextSaved).catch((error) => setDataNotice(error instanceof Error ? error.message : "Could not update saved venues."));
    else window.localStorage.setItem("getgigs-demo-saved-v1", JSON.stringify([...savedOpportunityIds]));
  };
  const requireAuth = () => setAuth({ mode: "login", locked: true });
  const startApplication = (opportunity: Opportunity) => visitorMode === "guest" ? requireAuth() : setApplying(opportunity);
  const navigate = (next: Section) => { if (next === "profile" && visitorMode === "guest") return requireAuth(); setApplying(null); setSection(next); };
  const logOut = async () => { await signOut(); setVisitorMode(null); setApplying(null); setAccountMenu(false); window.localStorage.removeItem("getgigs-visitor-mode-v1"); window.history.replaceState({}, "", "/"); };

  if (window.location.pathname === "/reset-password") return <ResetPasswordScreen onSave={updatePassword} onDone={() => window.location.assign("/")}/>;
  if (authLoading) return <div className="gg-auth-loading"><span>GetGigs</span><p>Restoring your account…</p></div>;
  if (requestedRole && account && account.role !== requestedRole) return <AccessDenied currentRole={account.role} requestedRole={requestedRole} onBack={() => { window.history.replaceState({}, "", account.role === "artist" ? "/artist/explore" : account.role === "booker" ? "/booker/discover" : "/admin"); window.location.reload(); }}/>;

  if (!accessMode || (requestedRole && !session)) return <><WelcomeScreen onSignUpArtist={() => setAuth({ mode:"signup", role:"artist", locked:false })} onSignUpBooker={() => setAuth({ mode:"signup", role:"booker", locked:false })} onLogIn={() => setAuth({ mode:"login", locked:false })} onGuest={() => enterVisitor("guest")} onDemo={() => enterVisitor("demo")}/>{auth && <AuthModal {...auth} signupRole={auth.role} onClose={() => requestedRole ? undefined : setAuth(null)} onSwitch={(mode,role) => setAuth({ ...auth, mode, role })} onAuthenticated={() => { setAuth(null); setVisitorMode(null); window.localStorage.removeItem("getgigs-visitor-mode-v1"); }}/>}</>;

  if (account?.role === "admin") return <main className="yondr-product-shell"><section className="yondr-product-view"><AdminDashboard venues={venues} onVenuesChange={updateVenues}/><AccountMenu accountName={account.display_name||account.email} role="Admin" open={accountMenu} onToggle={()=>setAccountMenu(v=>!v)} onProfile={()=>setAccountMenu(false)} onSettings={()=>setAccountMenu(false)} onLogOut={()=>void logOut()}/></section></main>;
  if (account?.role === "booker") return <main className="yondr-product-shell"><section className="yondr-product-view"><BookerDashboard account={account}/><AccountMenu accountName={account.display_name||account.email} role="Looking for Artist" open={accountMenu} onToggle={()=>setAccountMenu(v=>!v)} onProfile={()=>setAccountMenu(false)} onSettings={()=>setAccountMenu(false)} onLogOut={()=>void logOut()}/></section></main>;

  const currentProfile = visitorMode === "demo" ? demoProfile : bookingProfile;
  return <main className="yondr-product-shell"><section className="yondr-product-view" aria-live="polite">
    <div className="yondr-editable-canvas">{applying ? <GigApplicationScreen opportunity={applying} profile={currentProfile} demo={visitorMode === "demo"} onClose={() => setApplying(null)} /> : <>
      {section === "explore" && <Version1Screen opportunities={venues} accessMode={accessMode} onRequireAuth={requireAuth} onSearch={(query,filters)=>{if(session)void recordSearch(session.user.id,query,filters).catch(()=>undefined)}} onApply={startApplication} savedOpportunityIds={savedOpportunityIds} onToggleSaved={toggleSavedOpportunity}/>}
      {section === "saved" && <Version2Screen opportunities={venues} accessMode={accessMode} onRequireAuth={requireAuth} savedOpportunityIds={savedOpportunityIds} onToggleSaved={toggleSavedOpportunity} onApply={startApplication} onExplore={() => setSection("explore")}/>}
      {section === "profile" && <ArtistBookingProfileScreen profile={currentProfile} onChange={updateBookingProfile} onUploadDocument={session?(file,label)=>uploadPrivateDocument(session.user.id,file,label):undefined}/>}
      {section === "community" && <CommunityScreen/>}
    </>}</div>
    {dataNotice && <button className="gg-data-notice" onClick={()=>setDataNotice("")}>{dataNotice}</button>}
    {!applying && session && account ? <AccountMenu accountName={account.display_name||account.email} role="Artist" open={accountMenu} onToggle={()=>setAccountMenu(v=>!v)} onProfile={()=>{setSection("profile");setAccountMenu(false)}} onSettings={()=>{setSection("profile");setAccountMenu(false)}} onLogOut={()=>void logOut()}/> : !applying && <button type="button" className="gg-session-chip" onClick={() => void logOut()} title="Return to welcome"><span>{visitorMode === "demo" ? "Demo" : "Guest"}</span><LogOut size={12}/></button>}
    {!applying && <nav className="yondr-product-nav" aria-label="Main navigation" data-no-edit>{NAV_ITEMS.map(({ id,label,icon:Icon }) => { const active=section===id; return <button type="button" key={id} className={active?"active":""} aria-current={active?"page":undefined} onClick={()=>navigate(id)}><Icon size={18} strokeWidth={active?2.2:1.5}/><span>{label}</span></button>; })}</nav>}
    {visitorMode === "demo" && !applying && <DemoCoach step={Math.max(0,Math.min(4,demoStep))} onStep={(step)=>{setDemoStep(step);window.localStorage.setItem("getgigs-demo-step-v1",String(step));}} onNavigate={(next)=>setSection(next)} onExit={()=>void logOut()}/>}
    {auth && <AuthModal {...auth} signupRole={auth.role} onClose={()=>setAuth(null)} onSwitch={(mode,role)=>setAuth({...auth,mode,role})} onAuthenticated={()=>{setAuth(null);setVisitorMode(null);window.localStorage.removeItem("getgigs-visitor-mode-v1");}}/>}
  </section></main>;
}

function AccountMenu({accountName,role,open,onToggle,onProfile,onSettings,onLogOut}:{accountName:string;role:string;open:boolean;onToggle:()=>void;onProfile:()=>void;onSettings:()=>void;onLogOut:()=>void}) { return <div className="gg-account-menu"><button className="gg-session-chip" onClick={onToggle}><UserRound size={13}/><span>{accountName}</span></button>{open&&<div><small>{role}</small><strong>{accountName}</strong><button onClick={onProfile}><UserRound size={14}/> Profile</button><button onClick={onSettings}><Settings size={14}/> Account Settings</button><button onClick={onLogOut}><LogOut size={14}/> Log Out</button></div>}</div>; }
function AccessDenied({currentRole,requestedRole,onBack}:{currentRole:string;requestedRole:string;onBack:()=>void}) { return <main className="gg-access-denied"><span>403</span><h1>Access denied</h1><p>Your {currentRole} account does not have permission to open the {requestedRole} workspace.</p><button onClick={onBack}>Return to GetGigs</button></main>; }
function ResetPasswordScreen({onSave,onDone}:{onSave:(password:string)=>Promise<void>;onDone:()=>void}) { const [password,setPassword]=useState("");const [confirm,setConfirm]=useState("");const [message,setMessage]=useState("");const submit=async(e:React.FormEvent)=>{e.preventDefault();if(password.length<8)return setMessage("Use at least 8 characters.");if(password!==confirm)return setMessage("The passwords do not match.");try{await onSave(password);setMessage("Password updated. You can return to GetGigs.");}catch(error){setMessage(error instanceof Error?error.message:"Could not update your password.")}};return <main className="gg-reset-page"><form onSubmit={submit}><span className="gg-kicker">Secure account recovery</span><h1>Choose a new password</h1><label>New password<input type="password" autoComplete="new-password" value={password} onChange={e=>setPassword(e.target.value)}/></label><label>Confirm password<input type="password" autoComplete="new-password" value={confirm} onChange={e=>setConfirm(e.target.value)}/></label>{message&&<p>{message}</p>}<button className="primary">Update password</button><button type="button" onClick={onDone}>Return to GetGigs</button></form></main>; }
function visitorModeFromStorage(): VisitorMode | null { const value=window.localStorage.getItem("getgigs-visitor-mode-v1"); return value==="guest"||value==="demo"?value:null; }
function requestedRoleFromPath(): AppRole | null { const path=window.location.pathname; return path.startsWith("/admin")?"admin":path.startsWith("/booker")?"booker":path.startsWith("/artist")?"artist":null; }
