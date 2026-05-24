interface EmptyStateProps {
  icon: string;
  title: string;
  description: string;
}

export function EmptyState({ icon, title, description }: EmptyStateProps) {
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
    </div>
  );
}