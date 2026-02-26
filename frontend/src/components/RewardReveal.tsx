interface RewardRevealProps {
  amount: number;
  onClaim: () => void;
}

export default function RewardReveal({ amount, onClaim }: RewardRevealProps) {
  return (
    <div className="glass-card reward-reveal-card">
      <div className="reward-reveal-icon">🏆</div>
      <h2 className="reward-reveal-title">You've Won ₹{amount}!</h2>
      <p className="reward-reveal-desc">
        Claim your instant cashback directly to your UPI account.
      </p>
      <p className="reward-reveal-validity">⏰ Valid for 30 days from today</p>
      <button
        onClick={onClaim}
        className="reward-claim-btn"
      >
        Fill Claim Form Below ↓
      </button>
    </div>
  );
}
