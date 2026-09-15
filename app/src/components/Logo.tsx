interface LogoProps {
  size?: number;
  variant?: 'full' | 'icon';
  className?: string;
}

export default function Logo({ size = 36, variant = 'full', className = '' }: LogoProps) {
  const icon = (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="logoGrad" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#6366f1" />
          <stop offset="100%" stopColor="#3b82f6" />
        </linearGradient>
        <linearGradient id="boltGrad" x1="18" y1="12" x2="30" y2="36" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#818cf8" />
          <stop offset="100%" stopColor="#6366f1" />
        </linearGradient>
      </defs>
      {/* Shield shape */}
      <path
        d="M24 4L40 12V22C40 33.05 33.05 42 24 44C14.95 42 8 33.05 8 22V12L24 4Z"
        fill="url(#logoGrad)"
        stroke="none"
      />
      {/* Inner shield highlight */}
      <path
        d="M24 6.5L38 13.5V22C38 31.8 31.8 40 24 41.8C16.2 40 10 31.8 10 22V13.5L24 6.5Z"
        fill="none"
        stroke="rgba(255,255,255,0.15)"
        strokeWidth="0.5"
      />
      {/* Split line — represents bill splitting */}
      <line x1="24" y1="11" x2="24" y2="37" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
      {/* Lightning bolt — settlement speed */}
      <path
        d="M21 15L27 15L24 22L30 22L20 34L23 25L17 25Z"
        fill="white"
        fillOpacity="0.95"
      />
      {/* Small shield overlay */}
      <path
        d="M24 10L32 14V20C32 25.5 28.5 30 24 31C19.5 30 16 25.5 16 20V14L24 10Z"
        fill="none"
        stroke="rgba(255,255,255,0.2)"
        strokeWidth="0.75"
      />
    </svg>
  );

  if (variant === 'icon') return icon;

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {icon}
      <div className="flex flex-col">
        <span className="text-[15px] font-semibold tracking-tight text-white leading-none">
          CryptoSplit
        </span>
        <span className="text-[9px] font-medium tracking-[0.15em] uppercase text-[#8F8F99] leading-none mt-0.5">
          Privacy-First Splitting
        </span>
      </div>
    </div>
  );
}
