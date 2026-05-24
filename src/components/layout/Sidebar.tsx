import { NavLink } from 'react-router-dom';

const navItems = [
  {
    to: '/',
    label: 'Dashboard',
    exact: true,
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
  },
  {
    to: '/progress',
    label: 'Progress',
    exact: false,
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
      </svg>
    ),
  },
  {
    to: '/history',
    label: 'History',
    exact: false,
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
  },
];

export function Sidebar() {
  return (
    <aside className="
      hidden lg:flex flex-col
      w-52 h-screen sticky top-0 shrink-0
      border-r
    "
      style={{ background: '#0A0B0F', borderColor: '#181B26' }}
    >
      {/* ── Logo ────────────────────────────── */}
      <div
        className="px-4 py-5"
        style={{ borderBottom: '1px solid #181B26' }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
            style={{ background: '#4B8EFF' }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 4v16M18 4v16M2 9h4M18 9h4M2 15h4M18 15h4" />
            </svg>
          </div>
          <div>
            <h1
              style={{
                fontFamily: "'Syne', sans-serif",
                fontWeight: 800,
                fontSize: 14,
                letterSpacing: '-0.01em',
                color: 'rgba(255,255,255,0.9)',
                lineHeight: 1,
              }}
            >
              GymBot
            </h1>
            <p className="label-xs mt-1">Tracker</p>
          </div>
        </div>
      </div>

      {/* ── Navigation ──────────────────────── */}
      <nav className="flex flex-col gap-0.5 flex-1 px-2 py-4">
        <p className="label-xs px-2 mb-3">Menu</p>

        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.exact}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 ${
                isActive ? 'active-nav' : 'inactive-nav'
              }`
            }
            style={({ isActive }) => ({
              background: isActive ? 'rgba(75,142,255,0.08)' : 'transparent',
              border: isActive ? '1px solid rgba(75,142,255,0.18)' : '1px solid transparent',
              color: isActive ? '#4B8EFF' : 'rgba(255,255,255,0.3)',
              fontFamily: "'Outfit', sans-serif",
              fontWeight: 600,
              fontSize: 13,
              letterSpacing: '0.02em',
              textDecoration: 'none',
            })}
          >
            <span style={{ opacity: 0.9, flexShrink: 0 }}>{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* ── Footer ──────────────────────────── */}
      <div
        className="px-4 py-4"
        style={{ borderTop: '1px solid #181B26' }}
      >
        <div className="flex items-center gap-2 mb-1">
          <div
            className="w-1.5 h-1.5 rounded-full shrink-0"
            style={{
              background: '#34C759',
              boxShadow: '0 0 6px rgba(52,199,89,0.6)',
              animation: 'pulse-green 2.5s infinite',
            }}
          />
          <span
            style={{
              fontSize: 10,
              fontFamily: "'Fira Code', monospace",
              color: 'rgba(255,255,255,0.25)',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
            }}
          >
            Connected
          </span>
        </div>
        <p
          style={{
            fontSize: 10,
            fontFamily: "'Fira Code', monospace",
            color: 'rgba(255,255,255,0.15)',
          }}
        >
          via Telegram Bot
        </p>
      </div>

      <style>{`
        .inactive-nav:hover {
          background: rgba(255,255,255,0.03) !important;
          color: rgba(255,255,255,0.55) !important;
          border-color: rgba(255,255,255,0.06) !important;
        }
        @keyframes pulse-green {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.4; }
        }
      `}</style>
    </aside>
  );
}