import React, { useState } from 'react';
import { useSubmitClaim } from '../hooks/useQueries';

interface ClaimFormProps {
  couponCode: string;
  rewardAmount: number;
  onSuccess?: () => void;
}

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Andaman and Nicobar Islands', 'Chandigarh', 'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry',
];

export default function ClaimForm({ couponCode, rewardAmount, onSuccess }: ClaimFormProps) {
  const [state, setState] = useState('');
  const [city, setCity] = useState('');
  const [upiId, setUpiId] = useState('');
  const [feedback, setFeedback] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const submitClaim = useSubmitClaim();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!state || !city.trim() || !upiId.trim()) return;

    // Reset any previous error state before retrying
    submitClaim.reset();

    submitClaim.mutate(
      {
        couponCode,
        rewardAmount,
        state,
        city: city.trim(),
        feedback: feedback.trim(),
        upiId: upiId.trim(),
      },
      {
        onSuccess: () => {
          setSubmitted(true);
          onSuccess?.();
        },
      },
    );
  };

  if (submitted) {
    return (
      <div className="claim-form-success">
        <div className="success-icon">✅</div>
        <h3>Claim Submitted!</h3>
        <p>Your reward of <strong>₹{rewardAmount}</strong> will be transferred to your UPI ID shortly.</p>
        <p className="success-coupon">Coupon: <strong>{couponCode}</strong></p>
      </div>
    );
  }

  // Derive a clean, user-friendly error message
  const errorMessage = submitClaim.isError
    ? (submitClaim.error instanceof Error
        ? submitClaim.error.message
        : 'Submission failed. Please try again.')
    : null;

  const isFormValid = !!state && !!city.trim() && !!upiId.trim();

  return (
    <div id="claim-form" className="claim-form-container">
      <div className="claim-form-header">
        <h2 className="claim-form-title">🎉 Claim Your Reward</h2>
        <p className="claim-form-subtitle">
          You won <span className="reward-highlight">₹{rewardAmount}</span>! Fill in your details to receive the payment.
        </p>
        <div className="coupon-display">
          <span className="coupon-label">Coupon Code:</span>
          <span className="coupon-code">{couponCode}</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="claim-form">
        {/* State */}
        <div className="form-group">
          <label htmlFor="state" className="form-label">
            State <span className="required">*</span>
          </label>
          <select
            id="state"
            value={state}
            onChange={(e) => setState(e.target.value)}
            required
            className="form-select"
          >
            <option value="">Select your state</option>
            {INDIAN_STATES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        {/* City */}
        <div className="form-group">
          <label htmlFor="city" className="form-label">
            City <span className="required">*</span>
          </label>
          <input
            id="city"
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="Enter your city"
            required
            className="form-input"
          />
        </div>

        {/* UPI ID */}
        <div className="form-group">
          <label htmlFor="upiId" className="form-label">
            UPI ID <span className="required">*</span>
          </label>
          <input
            id="upiId"
            type="text"
            value={upiId}
            onChange={(e) => setUpiId(e.target.value)}
            placeholder="e.g. yourname@upi"
            required
            className="form-input"
          />
        </div>

        {/* Feedback */}
        <div className="form-group">
          <label htmlFor="feedback" className="form-label">
            Feedback <span className="optional">(optional)</span>
          </label>
          <textarea
            id="feedback"
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="Share your experience with Vitalis Water…"
            rows={3}
            className="form-textarea"
          />
        </div>

        {/* Inline error — shown after failed submission, button stays enabled for retry */}
        {errorMessage && (
          <div className="form-submit-error" role="alert">
            ⚠️ {errorMessage}
          </div>
        )}

        {/* Submit — only disabled while actively pending, NOT when in error state */}
        <button
          type="submit"
          disabled={submitClaim.isPending || !isFormValid}
          className="form-submit-btn"
        >
          {submitClaim.isPending ? (
            <span className="btn-loading">
              <span className="spinner" /> Submitting…
            </span>
          ) : submitClaim.isError ? (
            '🔄 Retry Submission'
          ) : (
            '💸 Submit Claim'
          )}
        </button>

        <p className="form-disclaimer">
          * Reward will be transferred within 3–5 business days to your UPI ID.
        </p>
      </form>
    </div>
  );
}
