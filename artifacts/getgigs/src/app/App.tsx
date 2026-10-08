import { useState } from "react";
import { Bookmark, Compass, LogOut, UserRound, UsersRound } from "lucide-react";
import Version1Screen from "./components/v1/Version1Screen";
import Version2Screen from "./components/v2/Version2Screen";
import CommunityScreen from "./components/community/CommunityScreen";
import ArtistBookingProfileScreen from "./components/profile/ArtistBookingProfileScreen";
import GigApplicationScreen from "./components/application/GigApplicationScreen";
import ManageVenuesScreen from "./components/admin/ManageVenuesScreen";
import WelcomeScreen from "./components/auth/WelcomeScreen";
import AuthModal from "./components/auth/AuthModal";
import DemoCoach from "./components/auth/DemoCoach";
import { EMPTY_PROFILE, MAYA_PROFILE, type BookingProfile } from "./data/bookingProfile";
import { OPPORTUNITIES, type Opportunity } from "./data/opportunities";

type Section = "explore" | "saved" | "profile" | "community" | "admin";
type AccessMode = "guest" | "authenticated" | "demo";

const NAV_ITEMS = [
  { id: "explore" as const, label: "Explore", icon: Compass },
  { id: "saved" as const, label: "Saved", icon: Bookmark },
  { id: "profile" as const, label: "Profile", icon: UserRound },
  { id: "community" as const, label: "Community", icon: UsersRound },
];

export default function App() {
  const [accessMode, setAccessMode] = useState<AccessMode | null>(() => {
    const value = window.localStorage.getItem("getgigs-access-mode-v1");
    return value === "guest" || value === "authenticated" || value === "demo" ? value : null;
  });
  const [section, setSection] = useState<Section>(() => accessModeFromStorage() === "demo" ? "profile" : "explore");
  const [auth, setAuth] = useState<{ mode: "login" | "signup"; locked: boolean } | null>(null);
  const [demoStep, setDemoStep] = useState(() => Number(window.localStorage.getItem("getgigs-demo-step-v1") || 0));
  const [applying, setApplying] = useState<Opportunity | null>(null);
  const [savedOpportunityIds, setSavedOpportunityIds] = useState<Set<string>>(() => {
    try { const stored = window.localStorage.getItem("getgigs-saved-opportunities-v1"); return new Set<string>(stored ? JSON.parse(stored) : ["lilypad-opening-set", "cafe-939-songwriter-night"]); }
    catch { return new Set(["lilypad-opening-set", "cafe-939-songwriter-night"]); }
  });
  const [venues, setVenues] = useState<Opportunity[]>(() => {
    try { const parsed = JSON.parse(window.localStorage.getItem("getgigs-venues-v2") || "null"); return Array.isArray(parsed) && parsed.every((item) => item.publicInfo && item.bookingInfo) ? parsed : OPPORTUNITIES; }
    catch { return OPPORTUNITIES; }
  });
  const [bookingProfile, setBookingProfile] = useState<BookingProfile>(() => {
    try { const stored = window.localStorage.getItem("getgigs-booking-profile-v2") || window.localStorage.getItem("getgigs-booking-profile-v1"); return stored ? { ...EMPTY_PROFILE, ...JSON.parse(stored) } : EMPTY_PROFILE; }
    catch { return EMPTY_PROFILE; }
  });
  const [demoProfile, setDemoProfile] = useState(MAYA_PROFILE);

  const persist = (key: string, value: unknown) => {
    try { window.localStorage.setItem(key, JSON.stringify(value)); }
    catch { window.alert("This browser is out of local prototype storage. Remove a large uploaded image and try again."); }
  };
  const enter = (mode: AccessMode) => { setAccessMode(mode); window.localStorage.setItem("getgigs-access-mode-v1", mode); setSection(mode === "demo" ? "profile" : "explore"); if (mode === "demo") { setDemoStep(0); window.localStorage.setItem("getgigs-demo-step-v1", "0"); } };
  const updateBookingProfile = (next: BookingProfile) => { if (accessMode === "demo") setDemoProfile(next); else { setBookingProfile(next); persist("getgigs-booking-profile-v2", next); } };
  const updateVenues = (next: Opportunity[]) => { setVenues(next); persist("getgigs-venues-v2", next); };
  const toggleSavedOpportunity = (id: string) => setSavedOpportunityIds((current) => { const next = new Set(current); if (next.has(id)) next.delete(id); else next.add(id); persist("getgigs-saved-opportunities-v1", [...next]); return next; });
  const requireAuth = () => setAuth({ mode: "login", locked: true });
  const startApplication = (opportunity: Opportunity) => accessMode === "guest" ? requireAuth() : setApplying(opportunity);
  const navigate = (next: Section) => { if (next === "profile" && accessMode === "guest") return requireAuth(); setApplying(null); setSection(next); };

  if (!accessMode) return <><WelcomeScreen onSignUp={() => setAuth({ mode: "signup", locked: false })} onLogIn={() => setAuth({ mode: "login", locked: false })} onGuest={() => enter("guest")} onDemo={() => enter("demo")}/>{auth && <AuthModal {...auth} onClose={() => setAuth(null)} onSwitch={(mode) => setAuth({ ...auth, mode })} onAuthenticated={() => { setAuth(null); enter("authenticated"); }}/>}</>;

  const profile = accessMode === "demo" ? demoProfile : bookingProfile;

  return (
    <main className="yondr-product-shell">
      <section className="yondr-product-view" aria-live="polite">
        <div className="yondr-editable-canvas">
          {applying ? <GigApplicationScreen opportunity={applying} profile={profile} demo={accessMode === "demo"} onClose={() => setApplying(null)} /> : <>
            {section === "explore" && (
              <Version1Screen opportunities={venues} accessMode={accessMode} onRequireAuth={requireAuth} onApply={startApplication} savedOpportunityIds={savedOpportunityIds} onToggleSaved={toggleSavedOpportunity}/>
            )}
            {section === "saved" && (
              <Version2Screen opportunities={venues} accessMode={accessMode} onRequireAuth={requireAuth} savedOpportunityIds={savedOpportunityIds} onToggleSaved={toggleSavedOpportunity} onApply={startApplication} onExplore={() => setSection("explore")}/>
            )}
            {section === "profile" && (
              <ArtistBookingProfileScreen profile={profile} onChange={updateBookingProfile} onManageVenues={() => setSection("admin")}/>
            )}
            {section === "community" && <CommunityScreen/>}
            {section === "admin" && (
              <ManageVenuesScreen venues={venues} onChange={updateVenues} onClose={() => setSection("profile")}/>
            )}
          </>}
        </div>

        {!applying && section !== "admin" && <button type="button" className="gg-session-chip" onClick={() => { setAccessMode(null); setApplying(null); window.localStorage.removeItem("getgigs-access-mode-v1"); }} title="Return to welcome"><span>{accessMode === "demo" ? "Demo" : accessMode === "guest" ? "Guest" : "Artist"}</span><LogOut size={12}/></button>}

        {!applying && section !== "admin" && <nav className="yondr-product-nav" aria-label="Main navigation" data-no-edit>
          {NAV_ITEMS.map(({ id, label, icon: Icon }) => { const active = section === id; return <button type="button" key={id} className={active ? "active" : ""} aria-current={active ? "page" : undefined} onClick={() => navigate(id)}><Icon size={18} strokeWidth={active ? 2.2 : 1.5}/><span>{label}</span></button>; })}
        </nav>}

        {accessMode === "demo" && !applying && section !== "admin" && (
          <DemoCoach step={Math.max(0, Math.min(4, demoStep))} onStep={(step) => { setDemoStep(step); window.localStorage.setItem("getgigs-demo-step-v1", String(step)); }} onNavigate={(next) => setSection(next)} onExit={() => { setAccessMode(null); window.localStorage.removeItem("getgigs-access-mode-v1"); }}/>
        )}
        {auth && (
          <AuthModal {...auth} onClose={() => setAuth(null)} onSwitch={(mode) => setAuth({ ...auth, mode })} onAuthenticated={() => { setAuth(null); enter("authenticated"); }}/>
        )}
      </section>
    </main>
  );
}

function accessModeFromStorage(): AccessMode | null { const value = window.localStorage.getItem("getgigs-access-mode-v1"); return value === "guest" || value === "authenticated" || value === "demo" ? value : null; }
