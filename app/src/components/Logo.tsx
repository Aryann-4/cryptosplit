interface LogoProps {
  size?: number;
  variant?: 'full' | 'icon';
  className?: string;
}

export default function Logo({ size = 36, variant = 'full', className = '' }: LogoProps) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="logoGrad" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#fbbf24" />
            <stop offset="100%" stopColor="#f59e0b" />
          </linearGradient>
        </defs>
        <path
          d="M24 4L40 12V22C40 33.05 33.05 42 24 44C14.95 42 8 33.05 8 22V12L24 4Z"
          fill="url(#logoGrad)"
          stroke="none"
        />
        <path
          d="M24 6.5L38 13.5V22C38 31.8 31.8 40 24 41.8C16.2 40 10 31.8 10 22V13.5L24 6.5Z"
          fill="none"
          stroke="rgba(255,255,255,0.15)"
          strokeWidth="0.5"
        />
        <line x1="24" y1="11" x2="24" y2="37" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
        <path d="M21 15L27 15L24 22L30 22L20 34L23 25L17 25Z" fill="white" fillOpacity="0.95" />
      </svg>
      {variant === 'full' && (
        <span className="text-[15px] font-semibold tracking-tight text-white leading-none">
          CryptoSplit
        </span>
      )}
    </div>
  );
}
