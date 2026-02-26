import { useState, useCallback } from 'react';
import Logo from '../components/Logo';
import ScratchCard from '../components/ScratchCard';
import RewardReveal from '../components/RewardReveal';
import ClaimForm from '../components/ClaimForm';
import Confetti from '../components/Confetti';
import WaterDropIntro from '../components/WaterDropIntro';
import ConfirmationNotification from '../components/ConfirmationNotification';
import AdminLoginModal from '../components/AdminLoginModal';
import Footer from '../components/Footer';
import { generateUniqueCode, generateReward } from '../utils/rewardGenerator';

interface ScratchPageProps {
  onAdminLoginSuccess: () => void;
}

export default function ScratchPage({ onAdminLoginSuccess }: ScratchPageProps) {
  const [showIntro, setShowIntro] = useState(true);
  const [scratchComplete, setScratchComplete] = useState(false);
  const [confettiTriggered, setConfettiTriggered] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [couponCode, setCouponCode] = useState(() => generateUniqueCode());
  const [rewardAmount, setRewardAmount] = useState(() => generateReward());

  const handleReveal = useCallback(() => {
    const newCode = generateUniqueCode();
    const newAmount = generateReward();
    setCouponCode(newCode);
    setRewardAmount(newAmount);
    setScratchComplete(true);
    setConfettiTriggered(true);
  }, []);

  const handleClaimSuccess = useCallback(() => {
    setShowConfirmation(true);
  }, []);

  const handleAdminLoginSuccess = useCallback(() => {
    setShowAdminModal(false);
    onAdminLoginSuccess();
  }, [onAdminLoginSuccess]);

  const handleScrollToClaim = useCallback(() => {
    const el = document.getElementById('claim-form-section');
    el?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  if (showIntro) {
    return <WaterDropIntro onComplete={() => setShowIntro(false)} />;
  }

  return (
    <div className="scratch-page-bg min-h-screen flex flex-col">
      <Confetti triggered={confettiTriggered} />

      {showConfirmation && (
        <ConfirmationNotification
          amount={rewardAmount}
          onClose={() => setShowConfirmation(false)}
        />
      )}

      <AdminLoginModal
        open={showAdminModal}
        onClose={() => setShowAdminModal(false)}
        onSuccess={handleAdminLoginSuccess}
      />

      {/* Main content */}
      <main className="flex-1 flex flex-col items-center px-4 py-8 gap-8">
        {/* Logo */}
        <div className="w-full flex justify-center pt-2">
          <Logo onDoubleClick={() => setShowAdminModal(true)} />
        </div>

        {/* Tagline */}
        <div className="text-center">
          <p className="scratch-tagline">✨ Scan. Scratch. Win. ✨</p>
          <p className="scratch-subtitle">Your reward is hidden beneath — scratch to reveal!</p>
        </div>

        {/* Scratch Card Section */}
        <div className="scratch-card-wrapper">
          <ScratchCard
            couponCode={couponCode}
            rewardAmount={rewardAmount}
            onReveal={handleReveal}
          />
        </div>

        {/* Post-scratch sections — only visible after scratch complete */}
        <div
          className={`w-full max-w-sm flex flex-col gap-6 transition-all duration-700 ${
            scratchComplete
              ? 'opacity-100 translate-y-0 pointer-events-auto'
              : 'opacity-0 translate-y-8 pointer-events-none'
          }`}
          aria-hidden={!scratchComplete}
        >
          {scratchComplete && (
            <>
              <RewardReveal
                amount={rewardAmount}
                onClaim={handleScrollToClaim}
              />
              <div id="claim-form-section">
                <ClaimForm
                  couponCode={couponCode}
                  rewardAmount={rewardAmount}
                  onSuccess={handleClaimSuccess}
                />
              </div>
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
