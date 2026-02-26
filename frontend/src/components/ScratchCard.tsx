import { useScratchCanvas } from '../hooks/useScratchCanvas';

interface ScratchCardProps {
  couponCode: string;
  rewardAmount: number;
  onReveal: () => void;
}

export default function ScratchCard({ couponCode, rewardAmount, onReveal }: ScratchCardProps) {
  const { canvasRef, scratchProgress } = useScratchCanvas({ onReveal, revealThreshold: 0.6 });

  const isRevealed = scratchProgress >= 0.6;

  return (
    <div className="scratch-card-container">
      {/* Card face — always rendered beneath the canvas */}
      <div className="scratch-card-face">
        {/* Header strip */}
        <div className="scratch-card-header">
          <span className="scratch-card-brand">VITALIS WATER</span>
          <span className="scratch-card-badge">WINNER</span>
        </div>

        {/* Reward amount */}
        <div className="scratch-card-reward-section">
          <p className="scratch-card-you-won">🎉 Congratulations! You Won</p>
          <div className="scratch-card-amount">
            <span className="scratch-card-currency">₹</span>
            <span className="scratch-card-value">{rewardAmount}</span>
          </div>
          <p className="scratch-card-cashback">Instant Cashback</p>
        </div>

        {/* Coupon code */}
        <div className="scratch-card-code-section">
          <p className="scratch-card-code-label">YOUR UNIQUE CODE</p>
          <div className="scratch-card-code-badge">
            <span className="scratch-card-code-text">{couponCode}</span>
          </div>
        </div>

        {/* Footer */}
        <div className="scratch-card-footer">
          <span className="scratch-card-validity">Valid for 30 days • T&C Apply</span>
        </div>
      </div>

      {/* Scratch overlay canvas */}
      {!isRevealed && (
        <canvas
          ref={canvasRef}
          width={320}
          height={320}
          className="scratch-canvas"
          style={{ touchAction: 'none' }}
        />
      )}

      {/* Hint */}
      {!isRevealed && (
        <p className="scratch-hint">👆 Scratch here to reveal your reward</p>
      )}
    </div>
  );
}
