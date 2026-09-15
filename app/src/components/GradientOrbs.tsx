export default function GradientOrbs() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
      {/* Main mesh gradient orbs */}
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="orb orb-3" />
      <div className="orb orb-4" />
      <div className="orb orb-5" />

      {/* Noise texture overlay */}
      <div className="noise-overlay" />

      {/* Grid pattern */}
      <div className="grid-pattern" />
    </div>
  );
}
