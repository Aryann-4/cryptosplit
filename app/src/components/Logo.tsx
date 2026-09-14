interface LogoProps {
  size?: number;
  variant?: 'full' | 'icon';
  className?: string;
}

export default function Logo({ size = 32, variant = 'full', className = '' }: LogoProps) {
  return (
    <div className={`flex items-center space-x-2.5 ${className}`}>
      {/* Icon Mark */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="flex-shrink-0"
      >
        <defs>
          <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6366f1" />
            <stop offset="50%" stopColor="#8b5cf6" />
            <stop offset="100%" stopColor="#a855f7" />
          </linearGradient>
          <linearGradient id="logoGradient2" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#6366f1" />
          </linearGradient>
          <filter id="logoGlow">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Background shape - rounded shield */}
        <rect x="2" y="2" width="36" height="36" rx="10" fill="url(#logoGradient)" />

        {/* Split line - represents bill splitting */}
        <path
          d="M20 8L20 32"
          stroke="white"
          strokeWidth="2.5"
          strokeLinecap="round"
          opacity="0.9"
        />

        {/* Lightning bolt - represents settlement speed */}
        <path
          d="M16 14L22 14L19 20L25 20L17 30L20 22L14 22Z"
          fill="white"
          opacity="0.95"
        />

        {/* Shield overlay - represents privacy */}
        <path
          d="M20 6L32 12V20C32 26.6274 26.6274 32 20 32C13.3726 32 8 26.6274 8 20V12L20 6Z"
          stroke="white"
          strokeWidth="1.5"
          fill="none"
          opacity="0.4"
        />
      </svg>

      {/* Wordmark */}
      {variant === 'full' && (
        <div className="flex flex-col">
          <span className="text-lg font-bold tracking-tight text-white leading-none">
            Crypto
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-fuchsia-400">
              Split
            </span>
          </span>
          <span className="text-[10px] font-medium tracking-[0.2em] uppercase text-surface-500 leading-none mt-0.5">
            Privacy-First Splitting
          </span>
        </div>
      )}
    </div>
  );
}
