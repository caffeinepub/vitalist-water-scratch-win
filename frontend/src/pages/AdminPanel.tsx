import { useState, useMemo } from 'react';
import { useGetAllSubmissions, useGetRewardStats } from '../hooks/useQueries';
import type { Submission } from '../backend';

const ADMIN_PASSWORD = 'vitalis2024';

function formatTimestamp(ts: bigint): string {
  const ms = Number(ts) / 1_000_000;
  return new Date(ms).toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function goHome() {
  window.history.pushState({}, '', '/');
  window.dispatchEvent(new PopStateEvent('popstate'));
}

export default function AdminPanel() {
  const [authenticated, setAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [authError, setAuthError] = useState('');
  const [search, setSearch] = useState('');

  const { data: submissions = [], isLoading } = useGetAllSubmissions();
  const { data: statsData } = useGetRewardStats();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === ADMIN_PASSWORD) {
      setAuthenticated(true);
      setAuthError('');
    } else {
      setAuthError('Incorrect password. Please try again.');
    }
  };

  const filtered = useMemo(() => {
    if (!search.trim()) return submissions;
    const q = search.trim().toLowerCase();
    return submissions.filter((s: Submission) =>
      s.couponCode.toLowerCase().includes(q)
    );
  }, [submissions, search]);

  const rewardBreakdown = useMemo(() => {
    const counts: Record<number, number> = {};
    submissions.forEach((s: Submission) => {
      const amt = Number(s.rewardAmount);
      counts[amt] = (counts[amt] || 0) + 1;
    });
    return Object.entries(counts)
      .sort(([a], [b]) => Number(a) - Number(b))
      .map(([amount, count]) => ({ amount: Number(amount), count }));
  }, [submissions]);

  const totalSubmissions = statsData ? Number(statsData[0]) : submissions.length;

  if (!authenticated) {
    return (
      <div className="admin-login-root">
        <div className="admin-login-card">
          <div className="admin-login-logo">
            <img
              src="/assets/generated/vitalis-logo.dim_300x120.png"
              alt="Vitalis Water"
              className="admin-logo-img"
              onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
            />
          </div>
          <h1 className="admin-login-title">Admin Panel</h1>
          <p className="admin-login-sub">Enter your password to continue</p>
          <form onSubmit={handleLogin} className="admin-login-form">
            <input
              type="password"
              className="admin-login-input"
              placeholder="Password"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              autoFocus
            />
            {authError && <p className="admin-login-error">{authError}</p>}
            <button type="submit" className="admin-login-btn">
              🔐 Login
            </button>
          </form>
          <button className="admin-back-link" onClick={goHome}>← Back to Home</button>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-root">
      {/* Header */}
      <header className="admin-header">
        <div className="admin-header-inner">
          <img
            src="/assets/generated/vitalis-logo.dim_300x120.png"
            alt="Vitalis Water"
            className="admin-header-logo"
            onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
          />
          <div className="admin-header-right">
            <span className="admin-badge">Admin Dashboard</span>
            <button className="admin-logout-btn" onClick={() => setAuthenticated(false)}>
              Logout
            </button>
            <button className="admin-home-btn" onClick={goHome}>← Home</button>
          </div>
        </div>
      </header>

      <main className="admin-main">
        {/* Stats row */}
        <div className="admin-stats-row">
          <div className="admin-stat-card">
            <div className="admin-stat-icon">📊</div>
            <div className="admin-stat-value">{totalSubmissions}</div>
            <div className="admin-stat-label">Total Claims</div>
          </div>
          {rewardBreakdown.map(({ amount, count }) => (
            <div key={amount} className="admin-stat-card">
              <div className="admin-stat-icon">₹</div>
              <div className="admin-stat-value">{count}</div>
              <div className="admin-stat-label">₹{amount} Winners</div>
            </div>
          ))}
        </div>

        {/* Search */}
        <div className="admin-search-row">
          <input
            type="text"
            className="admin-search-input"
            placeholder="🔍  Search by coupon code…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <span className="admin-result-count">{filtered.length} result{filtered.length !== 1 ? 's' : ''}</span>
        </div>

        {/* Table */}
        <div className="admin-table-wrap">
          {isLoading ? (
            <div className="admin-loading">
              <div className="admin-spinner" />
              <p>Loading submissions…</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="admin-empty">
              <p>No submissions found{search ? ` for "${search}"` : ''}.</p>
            </div>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Coupon Code</th>
                  <th>Reward</th>
                  <th>State</th>
                  <th>City</th>
                  <th>UPI ID</th>
                  <th>Feedback</th>
                  <th>Submitted At</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((s: Submission) => (
                  <tr key={s.couponCode}>
                    <td><span className="admin-code">{s.couponCode}</span></td>
                    <td><span className="admin-reward-badge">₹{Number(s.rewardAmount)}</span></td>
                    <td>{s.state}</td>
                    <td>{s.city}</td>
                    <td><span className="admin-upi">{s.upiId}</span></td>
                    <td><span className="admin-feedback">{s.feedback}</span></td>
                    <td className="admin-ts">{formatTimestamp(s.timestamp)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  );
}
