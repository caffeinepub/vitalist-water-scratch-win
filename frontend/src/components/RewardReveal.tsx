interface RewardRevealProps {
  amount: number;
  visible: boolean;
  onClaim: () => void;
}

export default function RewardReveal({ amount, visible, onClaim }: RewardRevealProps) {
  if (!visible) return null;

  return (
    <div className="reward-reveal-section">
      <div className="reward-reveal-card">
        <div className="reward-reveal-icon">🎊</div>
        <p className="reward-reveal-label">Your Reward</p>
        <div className="reward-reveal-amount">₹{amount}</div>
        <p className="reward-reveal-desc">
          Congratulations! You've won a cashback reward. Fill in your details to receive the money directly in your account.
        </p>
        <div className="reward-reveal-validity">✅ Valid for 30 days from today</div>

        <button className="claim-btn" onClick={onClaim}>
          <span className="claim-btn-icon">💰</span>
          Click to Receive ₹{amount}
          <span className="claim-btn-arrow">→</span>
        </button>
      </div>
    </div>
  );
}
