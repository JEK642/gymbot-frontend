interface EmptyStateProps {
  icon: string;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-14 text-center">
      <div className="
        w-12 h-12 rounded-xl bg-slate-700
        flex items-center justify-center text-2xl mb-4
        border border-border
      ">
        {icon}
      </div>
      <h3 className="font-display font-semibold text-base text-element-secondary mb-1">
        {title}
      </h3>
      <p className="text-xs font-mono text-element-muted max-w-xs leading-relaxed">
        {description}
      </p>
      {action && (
        <button
          onClick={action.onClick}
          style={{
            marginTop: 16,
            padding: '8px 18px',
            borderRadius: 99,
            background: 'rgba(75,142,255,0.12)',
            border: '1px solid rgba(75,142,255,0.25)',
            color: '#4B8EFF',
            fontSize: 12,
            fontFamily: "'Outfit', sans-serif",
            fontWeight: 600,
            letterSpacing: '0.04em',
            cursor: 'pointer',
            transition: 'background 0.15s',
          }}
          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(75,142,255,0.2)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'rgba(75,142,255,0.12)')}
        >
          {action.label}
        </button>
      )}
    </div>
  );
}