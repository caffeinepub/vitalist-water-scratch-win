interface FooterProps {
  showAdminLink?: boolean;
}

export default function Footer({ showAdminLink = true }: FooterProps) {
  const year = new Date().getFullYear();
  const appId = encodeURIComponent(
    typeof window !== 'undefined' ? window.location.hostname : 'vitalis-water'
  );

  const goAdmin = (e: React.MouseEvent) => {
    e.preventDefault();
    window.history.pushState({}, '', '/admin');
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  return (
    <footer className="site-footer">
      <div className="footer-brand">
        <img
          src="/assets/generated/vitalis-logo.dim_300x120.png"
          alt="Vitalis Water"
          className="footer-logo"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).style.display = 'none';
          }}
        />
      </div>
      <p className="footer-copy">© {year} Vitalis Water. All rights reserved.</p>
      <p className="footer-tagline">Pure. Refreshing. Rewarding.</p>
      <p className="footer-built">
        Built with{' '}
        <span className="footer-heart">💙</span>
        {' '}using{' '}
        <a
          href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${appId}`}
          target="_blank"
          rel="noopener noreferrer"
          className="footer-link"
        >
          caffeine.ai
        </a>
      </p>
      {showAdminLink && (
        <a href="/admin" onClick={goAdmin} className="footer-admin-link">
          Admin
        </a>
      )}
    </footer>
  );
}
