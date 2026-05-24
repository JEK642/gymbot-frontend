import { NavLink } from 'react-router-dom';

const navItems = [
  {
    to: '/',
    label: 'Dashboard',
    exact: true,
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
      </svg>
    ),
  },
  {
    to: '/history',
    label: 'History',
    exact: false,
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
      bg-[#0D0E14] border-r border-[#181B26]
      px-3 py-5
    ">
      {/* ── Logo ────────────────────────────── */}
      <div className="mb-5 px-2 pb-5 border-b border-[#181B26]">
        <div className="flex items-center gap-2.5">
          {/* Icon box */}
          <div className="
            w-8 h-8 rounded-lg bg-accent
            flex items-center justify-center shrink-0
          ">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 4v16M18 4v16M2 9h4M18 9h4M2 15h4M18 15h4" />
            </svg>
          </div>
          <div>
            <h1 className="font-display text-sm font-bold tracking-wide text-element-primary leading-none">
              GymBot
            </h1>
            <p className="label-xs mt-0.5">
              Tracker
            </p>
          </div>
        </div>
      </div>

      {/* ── Navigation ──────────────────────── */}
      <nav className="flex flex-col gap-0.5 flex-1">
        <p className="label-xs px-2 mb-2">Menu</p>

        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.exact}
            className={({ isActive }) => `
              flex items-center gap-3 px-3 py-2.5 rounded-lg
              text-[12.5px] font-medium transition-all duration-150
              ${isActive
                ? 'bg-accent-subtle text-accent border border-accent/20'
                : 'text-element-muted hover:text-element-secondary hover:bg-slate-700 border border-transparent'
              }
            `}
          >
            <span className="shrink-0 opacity-80">{item.icon}</span>
            <span className="tracking-wide">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* ── Footer ──────────────────────────── */}
      <div className="border-t border-[#181B26] pt-4 px-2">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-signal-low animate-pulse-blue shrink-0" />
          <span className="text-[10px] font-mono text-element-muted tracking-wider">
            Connected
          </span>
        </div>
        <p className="text-[10px] font-mono text-element-muted mt-0.5">
          via Telegram Bot
        </p>
      </div>
    </aside>
  );
}