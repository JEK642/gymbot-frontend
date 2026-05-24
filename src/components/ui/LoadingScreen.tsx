export function LoadingScreen() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="flex flex-col items-center gap-4">

        {/* Animated ring */}
        <div style={{ position: 'relative', width: 36, height: 36 }}>
          <svg
            width="36" height="36"
            viewBox="0 0 36 36"
            style={{ transform: 'rotate(-90deg)' }}
          >
            {/* Track */}
            <circle
              cx="18" cy="18" r="14"
              fill="none"
              stroke="rgba(75,142,255,0.08)"
              strokeWidth="3"
            />
            {/* Spinning arc */}
            <circle
              cx="18" cy="18" r="14"
              fill="none"
              stroke="#4B8EFF"
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray="87.96"
              strokeDashoffset="66"
              style={{
                animation: 'loadingSpin 1.1s cubic-bezier(0.4,0,0.2,1) infinite',
                transformOrigin: '18px 18px',
              }}
            />
          </svg>
        </div>

        <span
          style={{
            fontSize: 10,
            fontFamily: "'Fira Code', monospace",
            color: 'rgba(255,255,255,0.2)',
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            animation: 'loadingFade 1.4s ease-in-out infinite',
          }}
        >
          Loading
        </span>
      </div>

      <style>{`
        @keyframes loadingSpin {
          0%   { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes loadingFade {
          0%, 100% { opacity: 0.4; }
          50%       { opacity: 1; }
        }
      `}</style>
    </div>
  );
}