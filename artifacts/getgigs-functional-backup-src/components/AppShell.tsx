import type { ReactNode } from 'react';
import { Link } from 'wouter';
import { Bell, Bookmark, Compass, Map, Music2, Search, UserRound, X } from 'lucide-react';

type Props = { children: ReactNode; path: string; artistName: string; savedCount: number; storageIssue: boolean; dismissStorageIssue: () => void };
export function AppShell({ children, path, artistName, savedCount, storageIssue, dismissStorageIssue }: Props) {
  const nav = [
    { href: '/', label: 'Discover', icon: <Compass size={16} /> },
    { href: '/matchmap', label: 'Matchmap', icon: <Map size={16} /> },
    { href: '/saved', label: 'Saved', icon: <Bookmark size={16} /> },
    { href: '/profile', label: 'Artist profile', icon: <UserRound size={16} /> },
  ];
  return <div className="app-shell">
    <header className="topbar">
      <Link href="/" className="brand" data-testid="link-home"><span className="brand-mark"><Music2 size={18} /></span><span className="brand-copy"><strong>getgigs</strong><small>Find the room that fits</small></span></Link>
      <nav className="navlinks" aria-label="Main navigation">{nav.map((item) => <Link href={item.href} key={item.href} className={`navlink ${path === item.href ? 'active' : ''}`} aria-current={path === item.href ? 'page' : undefined} data-testid={`link-nav-${item.label.toLowerCase().replaceAll(' ', '-')}`}>{item.icon}<span>{item.label}</span></Link>)}</nav>
      <div className="nav-actions">
        <Link href="/" className="icon-action" aria-label="Search venues" title="Search venues" data-testid="link-search"><Search size={18} /></Link>
        <details className="notification-menu">
          <summary className="icon-action" aria-label="Notifications" title="Notifications"><Bell size={18} /><span className="notification-dot" /></summary>
          <div className="notification-panel" role="status">
            <strong>Keep your profile up to date</strong>
            <p>Your artist details shape every match. Review your preferences when your sound or touring plans change.</p>
            <Link href="/profile" className="notification-link">Review artist profile</Link>
          </div>
        </details>
        <Link href="/saved" className="button ghost saved-top" data-testid="link-saved-top"><Bookmark size={15} /> {savedCount} saved</Link>
        <Link href="/profile" className="avatar" aria-label={`Edit ${artistName}'s artist profile`} data-testid="link-profile-avatar">{artistName.slice(0, 1).toUpperCase()}</Link>
      </div>
    </header>
    {storageIssue && <div className="notice" role="status" style={{ margin: '12px auto', maxWidth: 900, display: 'flex', justifyContent: 'space-between' }}>Your browser could not save this session. Changes will remain until you close this tab.<button className="button" onClick={dismissStorageIssue} aria-label="Dismiss storage notice"><X size={14} /></button></div>}
    {children}
  </div>;
}
