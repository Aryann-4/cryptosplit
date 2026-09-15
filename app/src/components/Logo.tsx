import { useEffect, useState } from 'react';

interface LogoProps {
  size?: number;
  variant?: 'full' | 'icon';
  className?: string;
  animated?: boolean;
}

export default function Logo({ size = 36, variant = 'full', className = '', animated = true }: LogoProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 100);
    return () => clearTimeout(t);
  }, []);

  const svgSize = size;
  const cx = 24;
  const cy = 24;
  const ringR = 20;
  const shieldScale = size / 48;

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <div className="relative" style={{ width: svgSize, height: svgSize }}>
        <svg
          width={svgSize}
          height={svgSize}
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="relative z-10"
        >
          <defs>
            <linearGradient id="shieldGrad" x1="12" y1="4" x2="36" y2="44" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#fbbf24" />
              <stop offset="50%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#d97706" />
            </linearGradient>
            <linearGradient id="boltGrad" x1="20" y1="14" x2="28" y2="34" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#fff" stopOpacity="1" />
              <stop offset="100%" stopColor="#fde68a" stopOpacity="0.9" />
            </linearGradient>
            <filter id="shieldGlow">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <filter id="boltGlow">
              <feGaussianBlur stdDeviation="1.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Shield body */}
          <path
            d="M24 4L40 12V22C40 33.05 33.05 42 24 44C14.95 42 8 33.05 8 22V12L24 4Z"
            fill="url(#shieldGrad)"
            filter="url(#shieldGlow)"
            className={animated ? 'origin-center' : ''}
            style={animated ? {
              animation: mounted ? 'shieldPulse 3s ease-in-out infinite' : 'none',
            } : {}}
          />

          {/* Inner shield edge */}
          <path
            d="M24 6.5L38 13.5V22C38 31.8 31.8 40 24 41.8C16.2 40 10 31.8 10 22V13.5L24 6.5Z"
            fill="none"
            stroke="rgba(255,255,255,0.12)"
            strokeWidth="0.5"
          />

          {/* Split line */}
          <line
            x1="24" y1="11" x2="24" y2="37"
            stroke="rgba(255,255,255,0.25)"
            strokeWidth="0.8"
            strokeDasharray={animated ? "2 2" : "none"}
            className={animated ? 'origin-center' : ''}
            style={animated ? {
              animation: mounted ? 'splitPulse 4s ease-in-out infinite' : 'none',
            } : {}}
          />

          {/* Lightning bolt */}
          <path
            d="M21 15L27 15L24 22L30 22L20 34L23 25L17 25Z"
            fill="url(#boltGrad)"
            filter="url(#boltGlow)"
            className={animated ? 'origin-center' : ''}
            style={animated ? {
              animation: mounted ? 'boltFlicker 5s ease-in-out infinite' : 'none',
              transformOrigin: '24px 24px',
            } : {}}
          />
        </svg>

        {/* Outer rotating ring */}
        {animated && (
          <svg
            width={svgSize}
            height={svgSize}
            viewBox="0 0 48 48"
            fill="none"
            className="absolute inset-0 z-20 pointer-events-none"
            style={{
              animation: mounted ? 'ringRotate 12s linear infinite' : 'none',
            }}
          >
            <circle
              cx={cx}
              cy={cy}
              r={ringR}
              fill="none"
              stroke="url(#shieldGrad)"
              strokeWidth="0.6"
              strokeDasharray="4 8 2 6"
              opacity="0.5"
            />
          </svg>
        )}

        {/* Orbiting dot */}
        {animated && (
          <div
            className="absolute z-30"
            style={{
              width: 4,
              height: 4,
              top: '50%',
              left: '50%',
              marginTop: -2,
              marginLeft: -2,
              animation: mounted ? 'orbitDot 6s linear infinite' : 'none',
            }}
          >
            <div className="w-full h-full rounded-full bg-gold shadow-[0_0_8px_rgba(251,191,36,0.8)]" />
          </div>
        )}
      </div>

      {variant === 'full' && (
        <span className="text-[15px] font-semibold tracking-tight text-white leading-none relative">
          <span className="relative z-10">Crypto</span>
          <span className="relative z-10 gradient-text">Split</span>
        </span>
      )}
    </div>
  );
}
