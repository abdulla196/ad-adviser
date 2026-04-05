'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV = [
  {
    label: 'Overview',
    href: '/',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
        <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
      </svg>
    ),
  },
  {
    label: 'Campaigns',
    href: '/campaigns',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
      </svg>
    ),
  },
  {
    label: 'Meta Ads',
    href: '/ads-manager/meta',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
      </svg>
    ),
  },
  {
    label: 'Create Ad',
    href: '/campaigns/create',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="9"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/>
      </svg>
    ),
  },
  {
    label: 'Analytics',
    href: '/analytics',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/>
        <line x1="6" y1="20" x2="6" y2="14"/><line x1="2" y1="20" x2="22" y2="20"/>
      </svg>
    ),
  },
  {
    label: 'Settings',
    href: '/settings',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3"/>
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
      </svg>
    ),
  },
];

const PLATFORMS = [
  { id: 'meta',     label: 'Meta',     color: '#1877F2', letter: 'M' },
  { id: 'tiktok',  label: 'TikTok',   color: '#010101', letter: 'T' },
  { id: 'snap',    label: 'Snapchat', color: '#FFFC00', letter: 'S', textColor: '#000' },
  { id: 'google',  label: 'Google',   color: '#4285F4', letter: 'G' },
];

const resolveBaseUrl = () => {
  const explicitUrl = process.env.NEXT_PUBLIC_API_URL;
  const localUrl = process.env.NEXT_PUBLIC_API_URL_LOCAL || 'http://localhost:5000';
  const productionUrl = 'https://ad-adviser-backend-2t9i7h75z-abdulla196s-projects.vercel.app';

  if (explicitUrl) {
    return explicitUrl.replace(/\/$/, '');
  }

  if (process.env.NODE_ENV !== 'production') {
    return localUrl.replace(/\/$/, '');
  }

  return productionUrl;
};

export default function Layout({ children }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [time, setTime] = useState('');
  const [platformStatus, setPlatformStatus] = useState({});

  useEffect(() => {
    const tick = () => {
      setTime(new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }));
    };
    tick();
    const id = setInterval(tick, 60000);
    return () => clearInterval(id);
  }, []);

  // Fetch real platform connection status
  useEffect(() => {
    const BASE_URL = resolveBaseUrl();
    fetch(`${BASE_URL}/api/auth/status`)
      .then(r => r.json())
      .then(data => { if (data?.platforms) setPlatformStatus(data.platforms); })
      .catch(() => {});
  }, []);

  const isActive = (href) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,300&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --bg:        #0a0a0f;
          --bg2:       #111118;
          --bg3:       #18181f;
          --border:    rgba(255,255,255,0.07);
          --border-hi: rgba(255,255,255,0.13);
          --text:      #f0eff5;
          --muted:     #7a7990;
          --accent:    #7c6af7;
          --accent2:   #a78bfa;
          --green:     #34d399;
          --red:       #f87171;
          --sidebar-w: ${collapsed ? '72px' : '228px'};
          --transition: 0.22s cubic-bezier(.4,0,.2,1);
        }

        html, body { background: var(--bg); color: var(--text); font-family: 'DM Sans', sans-serif; font-size: 15px; line-height: 1.6; -webkit-font-smoothing: antialiased; }

        .shell { display: flex; min-height: 100vh; }

        .sidebar {
          width: var(--sidebar-w);
          min-height: 100vh;
          background: var(--bg2);
          border-right: 1px solid var(--border);
          display: flex;
          flex-direction: column;
          position: fixed;
          top: 0; left: 0;
          z-index: 100;
          transition: width var(--transition);
          overflow: hidden;
        }

        .sidebar-logo {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 22px 18px 18px;
          border-bottom: 1px solid var(--border);
          min-height: 68px;
          overflow: hidden;
          white-space: nowrap;
        }
        .logo-mark {
          width: 36px; height: 36px;
          background: linear-gradient(135deg, var(--accent) 0%, var(--accent2) 100%);
          border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
          font-family: 'Syne', sans-serif;
          font-weight: 800;
          font-size: 16px;
          color: #fff;
          letter-spacing: -0.5px;
        }
        .logo-text {
          font-family: 'Syne', sans-serif;
          font-weight: 700;
          font-size: 16px;
          letter-spacing: -0.3px;
          color: var(--text);
          opacity: ${collapsed ? 0 : 1};
          transition: opacity var(--transition);
          white-space: nowrap;
        }
        .logo-text span { color: var(--accent2); }

        .sidebar-nav { flex: 1; padding: 12px 10px; overflow-y: auto; overflow-x: hidden; }
        .nav-section-label {
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--muted);
          padding: 8px 10px 6px;
          opacity: ${collapsed ? 0 : 1};
          transition: opacity var(--transition);
          white-space: nowrap;
        }

        .nav-item {
          display: flex;
          align-items: center;
          gap: 11px;
          padding: 10px 10px;
          border-radius: 9px;
          color: var(--muted);
          text-decoration: none;
          font-size: 14px;
          font-weight: 400;
          white-space: nowrap;
          overflow: hidden;
          transition: background 0.15s, color 0.15s;
          margin-bottom: 2px;
          position: relative;
        }
        .nav-item:hover { background: var(--bg3); color: var(--text); }
        .nav-item.active {
          background: rgba(124,106,247,0.14);
          color: var(--accent2);
          font-weight: 500;
        }
        .nav-item.active::before {
          content: '';
          position: absolute;
          left: 0; top: 20%; bottom: 20%;
          width: 3px;
          background: var(--accent);
          border-radius: 0 3px 3px 0;
        }
        .nav-item.meta-item { color: #1877F2; }
        .nav-item.meta-item:hover { background: rgba(24,119,242,0.1); color: #4a9cf5; }
        .nav-item.meta-item.active {
          background: rgba(24,119,242,0.15);
          color: #4a9cf5;
        }
        .nav-item.meta-item.active::before { background: #1877F2; }
        .nav-icon { flex-shrink: 0; width: 18px; display: flex; align-items: center; justify-content: center; }
        .nav-label {
          opacity: ${collapsed ? 0 : 1};
          transition: opacity var(--transition);
        }

        .platform-section { padding: 12px 10px 8px; border-top: 1px solid var(--border); }
        .platform-section-label {
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--muted);
          padding: 0 4px 8px;
          opacity: ${collapsed ? 0 : 1};
          transition: opacity var(--transition);
          white-space: nowrap;
        }
        .platform-row {
          display: flex;
          align-items: center;
          gap: 9px;
          padding: 7px 8px;
          border-radius: 8px;
          margin-bottom: 2px;
          cursor: pointer;
          transition: background 0.15s;
          overflow: hidden;
          white-space: nowrap;
        }
        .platform-row:hover { background: var(--bg3); }
        .platform-dot {
          width: 26px; height: 26px;
          border-radius: 7px;
          display: flex; align-items: center; justify-content: center;
          font-size: 11px;
          font-weight: 700;
          font-family: 'Syne', sans-serif;
          flex-shrink: 0;
        }
        .platform-name {
          font-size: 13px;
          color: var(--text);
          opacity: ${collapsed ? 0 : 1};
          transition: opacity var(--transition);
        }
        .platform-status {
          margin-left: auto;
          width: 7px; height: 7px;
          border-radius: 50%;
          flex-shrink: 0;
          opacity: ${collapsed ? 0 : 1};
          transition: opacity var(--transition);
        }
        .platform-status.connected { background: var(--green); box-shadow: 0 0 6px var(--green); }
        .platform-status.disconnected { background: var(--muted); }

        .sidebar-footer {
          padding: 12px 10px;
          border-top: 1px solid var(--border);
        }
        .collapse-btn {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: ${collapsed ? 'center' : 'flex-start'};
          gap: 10px;
          padding: 9px 10px;
          border-radius: 8px;
          background: none;
          border: 1px solid var(--border);
          color: var(--muted);
          cursor: pointer;
          font-family: 'DM Sans', sans-serif;
          font-size: 13px;
          transition: background 0.15s, color 0.15s, border-color 0.15s;
          white-space: nowrap;
          overflow: hidden;
        }
        .collapse-btn:hover { background: var(--bg3); color: var(--text); border-color: var(--border-hi); }
        .collapse-icon { transition: transform var(--transition); transform: rotate(${collapsed ? '180deg' : '0deg'}); flex-shrink: 0; }
        .collapse-label {
          opacity: ${collapsed ? 0 : 1};
          transition: opacity var(--transition);
        }

        .main {
          margin-left: var(--sidebar-w);
          flex: 1;
          display: flex;
          flex-direction: column;
          min-height: 100vh;
          transition: margin-left var(--transition);
          overflow: hidden;
        }

        .topbar {
          height: 68px;
          border-bottom: 1px solid var(--border);
          display: flex;
          align-items: center;
          padding: 0 28px;
          gap: 16px;
          background: var(--bg);
          position: sticky;
          top: 0;
          z-index: 50;
          backdrop-filter: blur(12px);
        }
        .topbar-mobile-btn {
          display: none;
          background: none;
          border: none;
          color: var(--muted);
          cursor: pointer;
          padding: 6px;
          border-radius: 7px;
        }
        .topbar-title {
          font-family: 'Syne', sans-serif;
          font-weight: 600;
          font-size: 17px;
          letter-spacing: -0.2px;
          color: var(--text);
        }
        .topbar-breadcrumb {
          font-size: 13px;
          color: var(--muted);
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .breadcrumb-sep { opacity: 0.4; }
        .topbar-right {
          margin-left: auto;
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .topbar-time {
          font-size: 12px;
          color: var(--muted);
          font-variant-numeric: tabular-nums;
        }
        .topbar-refresh-btn {
          display: flex;
          align-items: center;
          gap: 7px;
          padding: 7px 14px;
          border-radius: 8px;
          border: 1px solid var(--border);
          background: var(--bg2);
          color: var(--muted);
          cursor: pointer;
          font-family: 'DM Sans', sans-serif;
          font-size: 13px;
          transition: all 0.15s;
        }
        .topbar-refresh-btn:hover { background: var(--bg3); color: var(--text); border-color: var(--border-hi); }
        .avatar {
          width: 34px; height: 34px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--accent), var(--accent2));
          display: flex; align-items: center; justify-content: center;
          font-family: 'Syne', sans-serif;
          font-weight: 700;
          font-size: 13px;
          color: #fff;
          cursor: pointer;
          border: 2px solid var(--border-hi);
        }

        .page-content { flex: 1; padding: 28px; }

        .mobile-overlay {
          display: none;
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.6);
          z-index: 99;
          backdrop-filter: blur(2px);
        }

        @media (max-width: 768px) {
          .sidebar {
            width: 228px !important;
            transform: translateX(${mobileOpen ? '0' : '-100%'});
            transition: transform var(--transition);
          }
          .main { margin-left: 0 !important; }
          .topbar-mobile-btn { display: flex; }
          .topbar-time { display: none; }
          .mobile-overlay { display: ${mobileOpen ? 'block' : 'none'}; }
        }

        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: var(--border-hi); border-radius: 10px; }

        .page-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          margin-bottom: 24px;
          gap: 16px;
        }
        .page-title {
          font-family: 'Syne', sans-serif;
          font-weight: 700;
          font-size: 24px;
          letter-spacing: -0.5px;
          color: var(--text);
          line-height: 1.2;
        }
        .page-subtitle {
          font-size: 14px;
          color: var(--muted);
          margin-top: 4px;
        }
      `}</style>

      <div className="mobile-overlay" onClick={() => setMobileOpen(false)} />

      <div className="shell">
        <aside className="sidebar">
          <div className="sidebar-logo">
            <div className="logo-mark">A</div>
            <span className="logo-text">Ad<span>viser</span></span>
          </div>

          <nav className="sidebar-nav">
            <div className="nav-section-label">Menu</div>
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`nav-item${item.href === '/ads-manager/meta' ? ' meta-item' : ''}${isActive(item.href) ? ' active' : ''}`}
                onClick={() => setMobileOpen(false)}
              >
                <span className="nav-icon">{item.icon}</span>
                <span className="nav-label">{item.label}</span>
              </Link>
            ))}
          </nav>

          <div className="platform-section">
            <div className="platform-section-label">Platforms</div>
            {PLATFORMS.map((p) => {
              const connected = platformStatus[p.id]?.connected;
              return (
                <div key={p.id} className="platform-row">
                  <div className="platform-dot" style={{ background: p.color, color: p.textColor || '#fff' }}>
                    {p.letter}
                  </div>
                  <span className="platform-name">{p.label}</span>
                  <span className={`platform-status ${connected ? 'connected' : 'disconnected'}`} />
                </div>
              );
            })}
          </div>

          <div className="sidebar-footer">
            <button className="collapse-btn" onClick={() => setCollapsed((v) => !v)}>
              <svg className="collapse-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6"/>
              </svg>
              <span className="collapse-label">Collapse</span>
            </button>
          </div>
        </aside>

        <div className="main">
          <header className="topbar">
            <button className="topbar-mobile-btn" onClick={() => setMobileOpen(true)}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
              </svg>
            </button>

            <div>
              <div className="topbar-title">
                {NAV.find((n) => isActive(n.href))?.label || 'Ad Adviser'}
              </div>
              <div className="topbar-breadcrumb">
                <span>Home</span>
                {pathname !== '/' && (
                  <>
                    <span className="breadcrumb-sep">›</span>
                    <span>{NAV.find((n) => isActive(n.href))?.label}</span>
                  </>
                )}
              </div>
            </div>

            <div className="topbar-right">
              <span className="topbar-time">{time}</span>
              <button className="topbar-refresh-btn">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="23 4 23 10 17 10"/>
                  <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
                </svg>
                Refresh
              </button>
              <div className="avatar">JD</div>
            </div>
          </header>

          <main className="page-content">
            {children}
          </main>
        </div>
      </div>
    </>
  );
}
