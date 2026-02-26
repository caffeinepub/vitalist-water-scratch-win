import { useEffect, useState } from 'react';

interface ConfirmationNotificationProps {
  amount: number;
  onClose: () => void;
}

export default function ConfirmationNotification({ amount, onClose }: ConfirmationNotificationProps) {
  const [visible, setVisible] = useState(false);
  const [ripple, setRipple] = useState(false);

  useEffect(() => {
    // Trigger entrance animation
    const t1 = setTimeout(() => setVisible(true), 50);
    const t2 = setTimeout(() => setRipple(true), 400);
    // Auto-close after 6 seconds
    const t3 = setTimeout(() => {
      setVisible(false);
      setTimeout(onClose, 500);
    }, 6000);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [onClose]);

  return (
    <div className={`confirm-overlay ${visible ? 'confirm-overlay-visible' : ''}`}>
      <div className={`confirm-card ${visible ? 'confirm-card-visible' : ''}`}>
        {/* Ripple rings */}
        <div className={`confirm-ripple-wrap ${ripple ? 'confirm-ripple-active' : ''}`}>
          <div className="confirm-ripple confirm-ripple-1" />
          <div className="confirm-ripple confirm-ripple-2" />
          <div className="confirm-ripple confirm-ripple-3" />
          <div className="confirm-check-circle">
            <svg viewBox="0 0 52 52" className="confirm-check-svg">
              <circle cx="26" cy="26" r="25" fill="none" className="confirm-check-bg-circle" />
              <path
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="4"
                d="M14 27l8 8 16-16"
                className="confirm-check-path"
              />
            </svg>
          </div>
        </div>

        <h2 className="confirm-title">Money on its way! 🎉</h2>
        <p className="confirm-amount">₹{amount}</p>
        <p className="confirm-message">
          Money will be in your account soon!
        </p>
        <p className="confirm-sub">
          Your reward has been processed. The amount will be credited to your UPI ID within 24–48 hours.
        </p>

        {/* Animated coins */}
        <div className="confirm-coins">
          {['🪙', '💰', '🪙', '💵', '🪙'].map((coin, i) => (
            <span key={i} className="confirm-coin" style={{ animationDelay: `${i * 0.15}s` }}>
              {coin}
            </span>
          ))}
        </div>

        <button className="confirm-close-btn" onClick={() => { setVisible(false); setTimeout(onClose, 400); }}>
          Done ✓
        </button>
      </div>
    </div>
  );
}
