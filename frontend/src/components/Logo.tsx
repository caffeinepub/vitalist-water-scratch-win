interface LogoProps {
  onDoubleClick?: () => void;
}

export default function Logo({ onDoubleClick }: LogoProps) {
  return (
    <header className="logo-section">
      <div className="logo-container">
        <img
          src="/assets/generated/vitalis-logo.dim_300x120.png"
          alt="Vitalis Water – Pure. Refreshing. Rewarding."
          className="logo-image"
          onDoubleClick={onDoubleClick}
          style={{ cursor: onDoubleClick ? 'default' : undefined }}
          onError={(e) => {
            const target = e.currentTarget;
            target.style.display = 'none';
            const fallback = target.nextElementSibling as HTMLElement;
            if (fallback) fallback.style.display = 'flex';
          }}
        />
        <div
          className="logo-fallback"
          style={{ display: 'none' }}
          onDoubleClick={onDoubleClick}
        >
          <div className="logo-drop">💧</div>
          <div className="logo-text">
            <span className="logo-brand">Vitalis</span>
            <span className="logo-sub">WATER</span>
          </div>
        </div>
      </div>
    </header>
  );
}
