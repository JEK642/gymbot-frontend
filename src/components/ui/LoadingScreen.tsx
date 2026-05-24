export function LoadingScreen() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="flex flex-col items-center gap-3">
        {/* Loading dots */}
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse-blue" />
          <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse-blue delay-100" />
          <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse-blue delay-200" />
        </div>
        <span className="text-[10px] font-mono text-element-muted tracking-widest uppercase">
          Loading
        </span>
      </div>
    </div>
  );
}