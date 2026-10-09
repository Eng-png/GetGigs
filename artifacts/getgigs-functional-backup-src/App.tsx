import { useState } from 'react';
import { Link, Route, Switch, Router as WouterRouter, useLocation } from 'wouter';
import { ErrorBoundary } from '@/components/error-boundary';
import { AppShell } from './components/AppShell';
import { initialArtist } from './data/constants';
import { useArtistApp } from './hooks/useArtistApp';
import { Discover } from './pages/Discover';
import { Matchmap } from './pages/Matchmap';
import { Onboarding } from './pages/Onboarding';
import { Profile } from './pages/Profile';
import { Saved } from './pages/Saved';
import { VenuePage } from './pages/VenuePage';

function NotFound() {
  return <main className="page-wrap"><div className="empty-state"><h3>This page wandered off-map</h3><p>Let’s get you back to finding a good room.</p><Link className="button primary" href="/">Back to Discover</Link></div></main>;
}

function RoutedApp() {
  const state = useArtistApp();
  const [path, setPath] = useLocation();
  const [revisiting, setRevisiting] = useState(false);
  const finishOnboarding = (artist: typeof initialArtist) => {
    state.setArtist(artist);
    state.setOnboarded(true);
    setPath(revisiting ? '/profile' : '/');
    setRevisiting(false);
  };
  if (!state.onboarded) return <Onboarding initial={state.artist || initialArtist} onComplete={finishOnboarding} recovered={state.storageIssue} />;
  return <AppShell path={path} artistName={state.artist.name} savedCount={state.savedIds.length} storageIssue={state.storageIssue} dismissStorageIssue={() => state.setStorageIssue(false)}>
    <ErrorBoundary resetKey={path}>
      <Switch>
        <Route path="/"><Discover artist={state.artist} savedIds={state.savedIds} onToggle={state.toggleSave} /></Route>
        <Route path="/matchmap"><Matchmap artist={state.artist} savedIds={state.savedIds} onToggle={state.toggleSave} /></Route>
        <Route path="/saved"><Saved artist={state.artist} savedIds={state.savedIds} savedAt={state.savedAt} onToggle={state.toggleSave} /></Route>
        <Route path="/profile"><Profile artist={state.artist} onSave={state.setArtist} onRevisit={() => { setRevisiting(true); state.setOnboarded(false); }} /></Route>
        <Route path="/venue/:id"><VenuePage artist={state.artist} savedIds={state.savedIds} onToggle={state.toggleSave} /></Route>
        <Route><NotFound /></Route>
      </Switch>
    </ErrorBoundary>
  </AppShell>;
}

function App() {
  return <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}><RoutedApp /></WouterRouter>;
}
export default App;