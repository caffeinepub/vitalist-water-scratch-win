import { useScratchCanvas } from '../hooks/useScratchCanvas';

interface ScratchCardProps {
  uniqueCode: string;
  rewardAmount: number;
  onReveal: () => void;
  revealed: boolean;
}

export default function ScratchCard({ uniqueCode, rewardAmount, onReveal, revealed }: ScratchCardProps) {
  const { canvasRef, scratchProgress } = useScratchCanvas({
    onReveal,
    revealThreshold: 0.6,
  });

  return (
    <div className="scratch-card-wrapper">
      {/* Card container */}
      <div className="scratch-card-container">
        {/* Unique code badge */}
        <div className="code-badge">
          <span className="code-label">CODE</span>
          <span className="code-value">{uniqueCode}</span>
        </div>

        {/* Reward area */}
        <div className="reward-area">
          <div className="reward-inner">
            <div className="reward-label">🎉 You Won!</div>
            <div className="reward-amount">₹{rewardAmount}</div>
            <div className="reward-sublabel">Cashback Reward</div>
          </div>
        </div>

        {/* Canvas overlay */}
        {!revealed && (
          <canvas
            ref={canvasRef}
            width={320}
            height={180}
            className="scratch-canvas"
            style={{ cursor: 'crosshair', touchAction: 'none' }}
          />
        )}

        {/* Progress hint */}
        {!revealed && scratchProgress > 0 && scratchProgress < 0.6 && (
          <div className="scratch-hint">
            {Math.round(scratchProgress * 100)}% scratched — keep going!
          </div>
        )}
      </div>
    </div>
  );
}
