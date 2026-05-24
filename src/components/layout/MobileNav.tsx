import { NavLink } from 'react-router-dom';

const navItems = [
  {
    to: '/', label: 'Home', exact: true,
    icon: (active: boolean) => (
      <svg width="20" height="20" viewBox="0 0 24 24"
        fill={active ? 'currentColor' : 'none'}
        stroke="currentColor" strokeWidth="2"
        strokeLinecap="round" strokeLinejoin="round"
      >
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
  },
  {
    to: '/progress', label: 'Progress', exact: false,
    icon: (active: boolean) => (
      <svg width="20" height="20" viewBox="0 0 24 24"
        fill="none" stroke="currentColor"
        strokeWidth={active ? 2.5 : 2}
        strokeLinecap="round" strokeLinejoin="round"
      >
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
      </svg>
    ),
  },
  {
    to: '/history', label: 'History', exact: false,
    icon: (active: boolean) => (
      <svg width="20" height="20" viewBox="0 0 24 24"
        fill="none" stroke="currentColor"
        strokeWidth={active ? 2.5 : 2}
        strokeLinecap="round" strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
  },
];

export function MobileNav() {
  return (
    <nav
      className="lg:hidden fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around px-2"
      style={{
        background: 'rgba(10,11,15,0.92)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderTop: '1px solid rgba(255,255,255,0.06)',
        paddingTop: 10,
        paddingBottom: 'max(24px, env(safe-area-inset-bottom))',
      }}
    >
      {navItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.exact}
          style={({ isActive }) => ({
            display: 'flex',
            flexDirection: 'column' as const,
            alignItems: 'center',
            gap: 4,
            padding: '4px 24px',
            color: isActive ? '#4B8EFF' : 'rgba(255,255,255,0.25)',
            textDecoration: 'none',
            transition: 'color 0.15s',
            position: 'relative' as const,
          })}
        >
          {({ isActive }) => (
            <>
              {/* Active indicator dot above icon */}
              {isActive && (
                <div
                  style={{
                    position: 'absolute',
                    top: -1,
                    width: 16,
                    height: 2,
                    borderRadius: 99,
                    background: '#4B8EFF',
                    boxShadow: '0 0 6px rgba(75,142,255,0.7)',
                  }}
                />
              )}
              {item.icon(isActive)}
              <span
                style={{
                  fontSize: 9,
                  fontFamily: "'Fira Code', monospace",
                  fontWeight: isActive ? 700 : 400,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                }}
              >
                {item.label}
              </span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}