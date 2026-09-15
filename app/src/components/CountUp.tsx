import { useEffect, useState } from 'react';

interface CountUpProps {
  target: number | string;
  duration?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}

export default function CountUp({ target, duration = 1500, prefix = '', suffix = '', className = '' }: CountUpProps) {
  const [display, setDisplay] = useState('0');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const numTarget = typeof target === 'number' ? target : parseInt(target, 10);

    if (isNaN(numTarget)) {
      setDisplay(String(target));
      return;
    }

    if (numTarget === 0) {
      setDisplay('0');
      return;
    }

    const startTime = Date.now();
    const step = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(eased * numTarget);
      setDisplay(current.toLocaleString());
      if (progress < 1) requestAnimationFrame(step);
    };
    const t = setTimeout(() => requestAnimationFrame(step), 300);
    return () => clearTimeout(t);
  }, [target, duration]);

  return (
    <span className={`${className} ${mounted ? 'count-enter' : 'opacity-0'}`}>
      {prefix}{display}{suffix}
    </span>
  );
}
