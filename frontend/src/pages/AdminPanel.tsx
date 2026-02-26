import { useState, useMemo } from 'react';
import {
  useGetAllSubmissions,
  useGetRewardStats,
  useMarkAsRedeemed,
} from '../hooks/useQueries';
import { useActor } from '../hooks/useActor';
import type { Submission } from '../backend';

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
        color: isRedeemed
          ? 'oklch(0.72 0.18 145)'
          : 'oklch(0.72 0.14 210)',
        border: `1px solid ${isRedeemed ? 'oklch(0.55 0.18 145 / 0.40)' : 'oklch(0.55 0.14 210 / 0.40)'}`,
      }}
    >
      <span style={{ fontSize: '0.6rem' }}>{isRedeemed ? '✓' : '●'}</span>
      {isRedeemed ? 'Redeemed' : 'Active'}
    </span>
  );
}

function CouponVerifyPanel() {
  const [inputCode, setInputCode] = useState('');
  const [verifyCode, setVerifyCode] = useState('');
  const { actor } = useActor();
  const [result, setResult] = useState<Submission | null | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { mutate: markRedeemed, isPending: isMarking } = useMarkAsRedeemed();

  const handleVerify = async () => {
    if (!inputCode.trim()) return;
    setError('');
    setResult(undefined);
    setLoading(true);
    setVerifyCode(inputCode.trim());
    try {
      if (!actor) throw new Error('Not connected');
      const sub = await actor.getSubmissionByCode(inputCode.trim());
      setResult(sub);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to fetch');
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkRedeemed = () => {
    if (!verifyCode) return;
    markRedeemed(verifyCode, {
      onSuccess: async () => {
        if (!actor) return;
        const updated = await actor.getSubmissionByCode(verifyCode);
        setResult(updated);
      },
    });
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

      <div className="admin-verify-input-row">
        <input
          type="text"
          className="admin-verify-input"
          placeholder="e.g. VW-A1B2-C3D4"
          value={inputCode}
          onChange={e => setInputCode(e.target.value.toUpperCase())}
          onKeyDown={e => e.key === 'Enter' && handleVerify()}
        />
        <button
          className="admin-verify-btn"
          onClick={handleVerify}
          disabled={loading || !inputCode.trim()}
        >
          {loading ? (
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
          ) : 'Verify'}
        </button>
      </div>

      {error && (
        <div className="admin-verify-error">⚠️ {error}</div>
      )}

      {result === null && !error && (
        <div className="admin-verify-not-found">
          ❌ No submission found for <strong>{verifyCode}</strong>
        </div>
      )}

      {result && (
        <div className="admin-verify-result">
          <div className="admin-verify-result-header">
            <div>
              <span className="admin-code">{result.couponCode}</span>
              <span className="admin-reward-badge" style={{ marginLeft: '8px' }}>₹{Number(result.rewardAmount)}</span>
            </div>
            <StatusBadge status={result.status} />
          </div>
          <div className="admin-verify-result-grid">
            <div className="admin-verify-field">
              <span className="admin-verify-field-label">State</span>
              <span className="admin-verify-field-value">{result.state}</span>
            </div>
            <div className="admin-verify-field">
              <span className="admin-verify-field-label">City</span>
              <span className="admin-verify-field-value">{result.city}</span>
            </div>
            <div className="admin-verify-field">
              <span className="admin-verify-field-label">UPI ID</span>
              <span className="admin-verify-field-value admin-upi">{result.upiId}</span>
            </div>
            <div className="admin-verify-field">
              <span className="admin-verify-field-label">Submitted</span>
              <span className="admin-verify-field-value">{formatTimestamp(result.timestamp)}</span>
            </div>
            <div className="admin-verify-field" style={{ gridColumn: '1 / -1' }}>
              <span className="admin-verify-field-label">Feedback</span>
              <span className="admin-verify-field-value">{result.feedback}</span>
            </div>
          </div>
          {result.status !== 'redeemed' && (
            <button
              className="admin-redeem-btn"
              onClick={handleMarkRedeemed}
              disabled={isMarking}
            >
              {isMarking ? (
                <span className="flex items-center gap-2 justify-center">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Marking…
                </span>
              ) : '✓ Mark as Redeemed / Close'}
            </button>
          )}
          {result.status === 'redeemed' && (
            <div className="admin-verify-redeemed-note">✅ This coupon has been marked as redeemed.</div>
          )}
        </div>
      )}
    </div>
  );
}

export default function AdminPanel() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'redeemed'>('all');

  const { data: submissions = [], isLoading } = useGetAllSubmissions();
  const { data: statsData } = useGetRewardStats();
  const { mutate: markRedeemed, isPending: isMarkingId, variables: markingCode } = useMarkAsRedeemed();

  const filtered = useMemo(() => {
    let list = submissions as Submission[];
    if (statusFilter !== 'all') {
      list = list.filter(s => s.status === statusFilter);
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(s => s.couponCode.toLowerCase().includes(q));
    }
    return list;
  }, [submissions, search, statusFilter]);

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
            onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
          />
          <div className="admin-header-right">
            <span className="admin-badge">Admin Dashboard</span>
            <button className="admin-home-btn" onClick={goHome}>← Home</button>
          </div>
        </div>
      </header>

      <main className="admin-main">
        {/* Stats row */}
        <div className="admin-stats-row">
          <div className="admin-stat-card admin-stat-card-primary">
            <div className="admin-stat-icon">📊</div>
            <div className="admin-stat-value">{totalSubmissions}</div>
            <div className="admin-stat-label">Total Claims</div>
          </div>
          <div className="admin-stat-card admin-stat-card-active">
            <div className="admin-stat-icon">🟢</div>
            <div className="admin-stat-value">{activeCount}</div>
            <div className="admin-stat-label">Active</div>
          </div>
          <div className="admin-stat-card admin-stat-card-redeemed">
            <div className="admin-stat-icon">✅</div>
            <div className="admin-stat-value">{redeemedCount}</div>
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

        {/* Coupon Verification Panel */}
        <CouponVerifyPanel />

        {/* Search & Filter */}
        <div className="admin-search-row">
          <input
            type="text"
            className="admin-search-input"
            placeholder="🔍  Search by coupon code…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div className="admin-filter-tabs">
            {(['all', 'active', 'redeemed'] as const).map(f => (
              <button
                key={f}
                className={`admin-filter-tab ${statusFilter === f ? 'admin-filter-tab-active' : ''}`}
                onClick={() => setStatusFilter(f)}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
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
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((s: Submission) => (
                  <tr key={s.couponCode} className={s.status === 'redeemed' ? 'admin-row-redeemed' : ''}>
                    <td><span className="admin-code">{s.couponCode}</span></td>
                    <td><span className="admin-reward-badge">₹{Number(s.rewardAmount)}</span></td>
                    <td>{s.state}</td>
                    <td>{s.city}</td>
                    <td><span className="admin-upi">{s.upiId}</span></td>
                    <td><span className="admin-feedback">{s.feedback}</span></td>
                    <td className="admin-ts">{formatTimestamp(s.timestamp)}</td>
                    <td><StatusBadge status={s.status} /></td>
                    <td>
                      {s.status !== 'redeemed' ? (
                        <button
                          className="admin-action-btn"
                          disabled={isMarkingId && markingCode === s.couponCode}
                          onClick={() => markRedeemed(s.couponCode)}
                        >
                          {isMarkingId && markingCode === s.couponCode ? (
                            <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24" fill="none">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                            </svg>
                          ) : '✓ Close'}
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
    </div>
  );
}
