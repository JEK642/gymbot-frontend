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
    <nav className="
      lg:hidden fixed bottom-0 left-0 right-0 z-50
      bg-[#0D0E14]/95 backdrop-blur-md
      border-t border-[#181B26]
      flex items-center justify-around
      px-2 pt-3 pb-6
    ">
      {navItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.exact}
          className={({ isActive }) => `
            flex flex-col items-center gap-1.5 px-6 py-1
            transition-colors duration-150
            ${isActive ? 'text-accent' : 'text-element-muted'}
          `}
        >
          {({ isActive }) => (
            <>
              {item.icon(isActive)}
              <span className="text-[10px] font-mono tracking-wider">
                {item.label}
              </span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}