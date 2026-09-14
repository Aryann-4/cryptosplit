interface LogoProps {
  size?: number;
  variant?: 'full' | 'icon';
  className?: string;
}

export default function Logo({ size = 24, variant = 'full', className = '' }: LogoProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="24" height="24" rx="6" fill="#0033FF" />
        <path d="M12 5L12 19" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.9" />
        <path d="M9.5 8.5L14.5 8.5L12.5 12.5L16 12.5L9 19L11 14L7.5 14Z" fill="white" />
      </svg>
      {variant === 'full' && (
        <span className="text-sm font-semibold tracking-tight text-cloud">
          CryptoSplit
        </span>
      )}
    </div>
  );
}
