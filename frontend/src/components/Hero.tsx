export default function Hero() {
  return (
    <section className="hero-section">
      <div className="hero-tagline">
        <span className="tagline-word">Scan.</span>{' '}
        <span className="tagline-word">Scratch.</span>{' '}
        <span className="tagline-word">Win.</span>
      </div>
      <div className="hero-bottle">
        <img
          src="/assets/generated/vitalist-bottle.dim_300x600.png"
          alt="Vitalis Water Bottle"
          className="bottle-image"
          onError={(e) => {
            const target = e.currentTarget;
            target.style.display = 'none';
            const fallback = target.nextElementSibling as HTMLElement;
            if (fallback) fallback.style.display = 'flex';
          }}
        />
        <div className="bottle-fallback" style={{ display: 'none' }}>
          <div className="bottle-emoji">🍶</div>
        </div>
      </div>
      <p className="hero-subtitle">Every bottle holds a surprise reward!</p>
    </section>
  );
}
