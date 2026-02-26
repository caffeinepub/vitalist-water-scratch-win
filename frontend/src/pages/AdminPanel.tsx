import React, { useState, useEffect, useMemo } from 'react';
import type { Submission } from '../backend';
import {
  useGetAllSubmissions,
  useGetRewardStats,
  useMarkAsRedeemed,
  useGetSubmissionByCode,
} from '../hooks/useQueries';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(ts: bigint): string {
  return new Date(Number(ts) / 1_000_000).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

// ─── Status Badge ─────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const isRedeemed = status === 'redeemed';
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        padding: '3px 10px',
        borderRadius: '20px',
        fontSize: '0.72rem',
        fontWeight: 700,
        letterSpacing: '0.05em',
        background: isRedeemed
          ? 'oklch(0.35 0.08 145 / 0.35)'
          : 'oklch(0.35 0.10 220 / 0.35)',
        color: isRedeemed ? 'oklch(0.72 0.18 145)' : 'oklch(0.72 0.14 210)',
        border: `1px solid ${isRedeemed ? 'oklch(0.55 0.18 145 / 0.40)' : 'oklch(0.55 0.14 210 / 0.40)'}`,
      }}
    >
      <span style={{ fontSize: '0.6rem' }}>{isRedeemed ? '✓' : '●'}</span>
      {isRedeemed ? 'Redeemed' : 'Active'}
    </span>
  );
}

// ─── Coupon Verify Panel ──────────────────────────────────────────────────────

function CouponVerifyPanel() {
  const [inputCode, setInputCode] = useState('');
  const [searchCode, setSearchCode] = useState('');
  const markAsRedeemed = useMarkAsRedeemed();

  const { data: found, isLoading, isError, error } = useGetSubmissionByCode(searchCode);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = inputCode.trim().toUpperCase();
    if (trimmed) setSearchCode(trimmed);
  };

  const handleRedeem = () => {
    if (!found) return;
    markAsRedeemed.mutate(found.couponCode);
  };

  return (
    <div className="admin-verify-panel">
      <div className="admin-verify-header">
        <span className="admin-verify-icon">🔍</span>
        <div>
          <h3 className="admin-verify-title">Coupon Verification</h3>
          <p className="admin-verify-sub">Enter a coupon code to verify and manage its status</p>
        </div>
      </div>

      <form onSubmit={handleSearch} className="admin-verify-input-row">
        <input
          type="text"
          className="admin-verify-input"
          placeholder="e.g. VW-A1B2-C3D4"
          value={inputCode}
          onChange={(e) => setInputCode(e.target.value.toUpperCase())}
        />
        <button
          type="submit"
          className="admin-verify-btn"
          disabled={isLoading || !inputCode.trim()}
        >
          {isLoading ? (
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
          ) : (
            'Verify'
          )}
        </button>
      </form>

      {isError && searchCode && (
        <div className="admin-verify-error">
          ⚠️ {error instanceof Error ? error.message : 'Failed to fetch'}
        </div>
      )}

      {!isLoading && !isError && searchCode && found === null && (
        <div className="admin-verify-not-found">
          ❌ No submission found for <strong>{searchCode}</strong>
        </div>
      )}

      {!isLoading && !isError && found && (
        <div className="admin-verify-result">
          <div className="admin-verify-result-header">
            <div>
              <span className="admin-code">{found.couponCode}</span>
              <span className="admin-reward-badge" style={{ marginLeft: '8px' }}>
                ₹{Number(found.rewardAmount)}
              </span>
            </div>
            <StatusBadge status={found.status} />
          </div>
          <div className="admin-verify-result-grid">
            <div className="admin-verify-field">
              <span className="admin-verify-field-label">State</span>
              <span className="admin-verify-field-value">{found.state}</span>
            </div>
            <div className="admin-verify-field">
              <span className="admin-verify-field-label">City</span>
              <span className="admin-verify-field-value">{found.city}</span>
            </div>
            <div className="admin-verify-field">
              <span className="admin-verify-field-label">UPI ID</span>
              <span className="admin-verify-field-value admin-upi">{found.upiId}</span>
            </div>
            <div className="admin-verify-field">
              <span className="admin-verify-field-label">Submitted</span>
              <span className="admin-verify-field-value">{formatDate(found.timestamp)}</span>
            </div>
            <div className="admin-verify-field" style={{ gridColumn: '1 / -1' }}>
              <span className="admin-verify-field-label">Feedback</span>
              <span className="admin-verify-field-value">{found.feedback || '—'}</span>
            </div>
          </div>
          {found.status !== 'redeemed' && (
            <button
              className="admin-redeem-btn"
              onClick={handleRedeem}
              disabled={markAsRedeemed.isPending}
            >
              {markAsRedeemed.isPending ? (
                <span className="flex items-center gap-2 justify-center">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Marking…
                </span>
              ) : (
                '✓ Mark as Redeemed / Close'
              )}
            </button>
          )}
          {found.status === 'redeemed' && (
            <div className="admin-verify-redeemed-note">✅ This coupon has been marked as redeemed.</div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Stats Row ────────────────────────────────────────────────────────────────

function StatsRow({ submissions }: { submissions: Submission[] }) {
  const total = submissions.length;
  const active = submissions.filter((s) => s.status === 'active').length;
  const redeemed = submissions.filter((s) => s.status === 'redeemed').length;

  const rewardBreakdown = useMemo(() => {
    const counts: Record<number, number> = {};
    submissions.forEach((s) => {
      const amt = Number(s.rewardAmount);
      counts[amt] = (counts[amt] || 0) + 1;
    });
    return Object.entries(counts)
      .sort(([a], [b]) => Number(a) - Number(b))
      .map(([amount, count]) => ({ amount: Number(amount), count }));
  }, [submissions]);

  return (
    <div className="admin-stats-row">
      <div className="admin-stat-card admin-stat-card-primary">
        <div className="admin-stat-icon">📊</div>
        <div className="admin-stat-value">{total}</div>
        <div className="admin-stat-label">Total Claims</div>
      </div>
      <div className="admin-stat-card admin-stat-card-active">
        <div className="admin-stat-icon">🟢</div>
        <div className="admin-stat-value">{active}</div>
        <div className="admin-stat-label">Active</div>
      </div>
      <div className="admin-stat-card admin-stat-card-redeemed">
        <div className="admin-stat-icon">✅</div>
        <div className="admin-stat-value">{redeemed}</div>
        <div className="admin-stat-label">Redeemed</div>
      </div>
      {rewardBreakdown.map(({ amount, count }) => (
        <div key={amount} className="admin-stat-card">
          <div className="admin-stat-icon">₹</div>
          <div className="admin-stat-value">{count}</div>
          <div className="admin-stat-label">₹{amount} Winners</div>
        </div>
      ))}
    </div>
  );
}

// ─── Main AdminPanel ──────────────────────────────────────────────────────────

interface AdminPanelProps {
  onLogout: () => void;
}

export default function AdminPanel({ onLogout }: AdminPanelProps) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'redeemed'>('all');

  const {
    data: submissions = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useGetAllSubmissions();

  const { mutate: markRedeemed, isPending: isMarkingId, variables: markingCode } = useMarkAsRedeemed();

  // Refetch on mount to ensure fresh data after a claim submission
  useEffect(() => {
    const timer = setTimeout(() => {
      refetch();
    }, 400);
    return () => clearTimeout(timer);
  }, [refetch]);

  const filtered = useMemo(() => {
    let list = submissions as Submission[];
    if (statusFilter !== 'all') {
      list = list.filter((s) => s.status === statusFilter);
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (s) =>
          s.couponCode.toLowerCase().includes(q) ||
          s.upiId.toLowerCase().includes(q) ||
          s.city.toLowerCase().includes(q) ||
          s.state.toLowerCase().includes(q),
      );
    }
    return list;
  }, [submissions, search, statusFilter]);

  const activeCount = submissions.filter((s: Submission) => s.status === 'active').length;
  const redeemedCount = submissions.filter((s: Submission) => s.status === 'redeemed').length;

  return (
    <div className="admin-root">
      {/* Header */}
      <header className="admin-header">
        <div className="admin-header-inner">
          <img
            src="/assets/generated/vitalis-logo.dim_300x120.png"
            alt="Vitalis Water"
            className="admin-header-logo"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).style.display = 'none';
            }}
          />
          <div className="admin-header-right">
            <span className="admin-badge">Admin Dashboard</span>
            <button
              className="admin-home-btn"
              onClick={() => {
                refetch();
              }}
              title="Refresh data"
            >
              🔄 Refresh
            </button>
            <button className="admin-home-btn" onClick={onLogout}>
              ← Logout
            </button>
          </div>
        </div>
      </header>

      <main className="admin-main">
        {/* Stats row */}
        <StatsRow submissions={submissions} />

        {/* Coupon Verification Panel */}
        <CouponVerifyPanel />

        {/* Search & Filter */}
        <div className="admin-search-row">
          <input
            type="text"
            className="admin-search-input"
            placeholder="🔍  Search by coupon, UPI, city, state…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div className="admin-filter-tabs">
            {(['all', 'active', 'redeemed'] as const).map((f) => (
              <button
                key={f}
                className={`admin-filter-tab ${statusFilter === f ? 'admin-filter-tab-active' : ''}`}
                onClick={() => setStatusFilter(f)}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
                {f === 'active' && (
                  <span className="tab-count-badge">{activeCount}</span>
                )}
                {f === 'redeemed' && (
                  <span className="tab-count-badge">{redeemedCount}</span>
                )}
                {f === 'all' && (
                  <span className="tab-count-badge">{submissions.length}</span>
                )}
              </button>
            ))}
          </div>
          <span className="admin-result-count">
            {filtered.length} result{filtered.length !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Table */}
        <div className="admin-table-wrap">
          {isLoading ? (
            <div className="admin-loading">
              <div className="admin-spinner" />
              <p>Loading submissions…</p>
            </div>
          ) : isError ? (
            <div className="admin-error-state">
              <p>⚠️ {error instanceof Error ? error.message : 'Failed to load submissions'}</p>
              <button
                className="admin-retry-btn"
                onClick={() => {
                  refetch();
                }}
              >
                Retry
              </button>
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
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((s: Submission) => (
                  <tr
                    key={s.couponCode}
                    className={s.status === 'redeemed' ? 'admin-row-redeemed' : ''}
                  >
                    <td>
                      <span className="admin-code">{s.couponCode}</span>
                    </td>
                    <td>
                      <span className="admin-reward-badge">₹{Number(s.rewardAmount)}</span>
                    </td>
                    <td>{s.state}</td>
                    <td>{s.city}</td>
                    <td>
                      <span className="admin-upi">{s.upiId}</span>
                    </td>
                    <td>
                      <span className="admin-feedback">{s.feedback || '—'}</span>
                    </td>
                    <td className="admin-ts">{formatDate(s.timestamp)}</td>
                    <td>
                      <StatusBadge status={s.status} />
                    </td>
                    <td>
                      {s.status !== 'redeemed' ? (
                        <button
                          className="admin-action-btn"
                          disabled={isMarkingId && markingCode === s.couponCode}
                          onClick={() => markRedeemed(s.couponCode)}
                        >
                          {isMarkingId && markingCode === s.couponCode ? (
                            <svg
                              className="animate-spin h-3 w-3"
                              viewBox="0 0 24 24"
                              fill="none"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              />
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8v8z"
                              />
                            </svg>
                          ) : (
                            '✓ Close'
                          )}
                        </button>
                      ) : (
                        <span className="admin-closed-label">Closed</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="admin-footer-bar">
        <p>
          © {new Date().getFullYear()} Vitalis Water. Built with{' '}
          <span style={{ color: 'oklch(0.65 0.2 25)' }}>♥</span> using{' '}
          <a
            href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: 'oklch(0.72 0.14 210)', textDecoration: 'underline' }}
          >
            caffeine.ai
          </a>
        </p>
      </footer>
    </div>
  );
}
