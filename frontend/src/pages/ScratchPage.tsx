import { useState, useEffect, useCallback, useRef } from 'react';
import WaterDropIntro from '../components/WaterDropIntro';
import Logo from '../components/Logo';
import Hero from '../components/Hero';
import ScratchCard from '../components/ScratchCard';
import RewardReveal from '../components/RewardReveal';
import ClaimForm from '../components/ClaimForm';
import ConfirmationNotification from '../components/ConfirmationNotification';
import Confetti from '../components/Confetti';
import Footer from '../components/Footer';
import { generateReward, generateUniqueCode } from '../utils/rewardGenerator';

export default function ScratchPage() {
  const [introComplete, setIntroComplete] = useState(false);
  const [contentVisible, setContentVisible] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [confettiTriggered, setConfettiTriggered] = useState(false);
  const [showClaimForm, setShowClaimForm] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const [reward] = useState(() => generateReward());
  const [uniqueCode] = useState(() => generateUniqueCode());

  const claimFormRef = useRef<HTMLDivElement>(null);

  const handleIntroComplete = useCallback(() => {
    setIntroComplete(true);
    setTimeout(() => setContentVisible(true), 100);
  }, []);

  const handleReveal = useCallback(() => {
    setRevealed(true);
    setConfettiTriggered(true);
  }, []);

  const handleClaimClick = useCallback(() => {
    setShowClaimForm(true);
    setTimeout(() => {
      claimFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  }, []);

  const handleClaimSuccess = useCallback(() => {
    setShowClaimForm(false);
    setShowConfirmation(true);
  }, []);

  const handleConfirmationClose = useCallback(() => {
    setShowConfirmation(false);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!introComplete) {
        setIntroComplete(true);
        setTimeout(() => setContentVisible(true), 100);
      }
    }, 2500);
    return () => clearTimeout(timer);
  }, [introComplete]);

  return (
    <div className="page-root">
      {!introComplete && <WaterDropIntro onComplete={handleIntroComplete} />}
      <Confetti triggered={confettiTriggered} />

      {showConfirmation && (
        <ConfirmationNotification amount={reward} onClose={handleConfirmationClose} />
      )}

      <div className={`main-content ${contentVisible ? 'content-visible' : 'content-hidden'}`}>
        <div className="page-container">
          <Logo />
          <Hero />

          <section className="congrats-section">
            <div className="congrats-badge">🎁 Special Offer</div>
            <h1 className="congrats-heading">Congratulations!</h1>
            <p className="congrats-subtext">
              You've been selected for an exclusive reward.
              <br />Scratch the card below to reveal your prize!
            </p>
          </section>

          <section className="scratch-section">
            <ScratchCard
              uniqueCode={uniqueCode}
              rewardAmount={reward}
              onReveal={handleReveal}
              revealed={revealed}
            />
            {!revealed && (
              <p className="scratch-instruction">
                👆 Scratch the silver area to reveal your reward
              </p>
            )}
          </section>

          <RewardReveal amount={reward} visible={revealed} onClaim={handleClaimClick} />

          {showClaimForm && (
            <div ref={claimFormRef}>
              <ClaimForm
                couponCode={uniqueCode}
                rewardAmount={reward}
                onSuccess={handleClaimSuccess}
              />
            </div>
          )}

          <Footer />
        </div>
      </div>
    </div>
  );
}
