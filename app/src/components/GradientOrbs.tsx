import { useEffect, useState } from 'react';

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  delay: number;
  duration: number;
}

function Particles() {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    const generated: Particle[] = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: 50 + Math.random() * 50,
      size: 1 + Math.random() * 2,
      delay: Math.random() * 8,
      duration: 4 + Math.random() * 6,
    }));
    setParticles(generated);
  }, []);

  return (
    <>
      {particles.map((p) => (
        <div
          key={p.id}
          className="particle"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            animation: `particleFloat ${p.duration}s ${p.delay}s ease-in-out infinite`,
          }}
        />
      ))}
    </>
  );
}

export default function GradientOrbs() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="orb orb-3" />
      <div className="orb orb-4" />
      <div className="orb orb-5" />
      <Particles />
      <div className="noise-overlay" />
      <div className="grid-pattern" />
    </div>
  );
}
