import React, { useState } from 'react';
import { useSubmitClaim } from '../hooks/useQueries';
import { Loader2 } from 'lucide-react';

interface ClaimFormProps {
  couponCode: string;
  rewardAmount: number;
  onSuccess: () => void;
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

  const submitClaimMutation = useSubmitClaim();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!state || !city || !upiId) {
      return;
    }

    submitClaimMutation.mutate(
      {
        couponCode,
        rewardAmount,
        state,
        city,
        feedback,
        upiId,
      },
      {
        onSuccess: () => {
          onSuccess();
        },
        onError: (error: Error) => {
          // Error is displayed inline via submitClaimMutation.error
          console.error('Claim submission error:', error.message);
        },
      }
    );
  };

  const isSubmitting = submitClaimMutation.isPending;
  const errorMessage = submitClaimMutation.error?.message;

  return (
    <div id="claim-form" className="claim-form-container glass-card">
      <div className="claim-form-header">
        <h2 className="claim-form-title">🎉 Claim Your Reward</h2>
        <p className="claim-form-subtitle">
          You won <span className="reward-highlight">₹{rewardAmount}</span>! Fill in your details to receive your reward.
        </p>
        <div className="coupon-code-display">
          <span className="coupon-label">Coupon Code:</span>
          <span className="coupon-value">{couponCode}</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="claim-form">
        <div className="form-group">
          <label htmlFor="state" className="form-label">
            State <span className="required">*</span>
          </label>
          <select
            id="state"
            value={state}
            onChange={(e) => setState(e.target.value)}
            className="form-select"
            required
            disabled={isSubmitting}
          >
            <option value="">Select your state</option>
            {INDIAN_STATES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

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
            className="form-input"
            required
            disabled={isSubmitting}
          />
        </div>

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
            className="form-input"
            required
            disabled={isSubmitting}
          />
        </div>

        <div className="form-group">
          <label htmlFor="feedback" className="form-label">
            Feedback <span className="optional">(optional)</span>
          </label>
          <textarea
            id="feedback"
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="Share your experience with Vitalis Water..."
            className="form-textarea"
            rows={3}
            disabled={isSubmitting}
          />
        </div>

        {errorMessage && (
          <div className="form-submit-error">
            <span>⚠️ {errorMessage}</span>
          </div>
        )}

        <button
          type="submit"
          className="form-submit-btn"
          disabled={isSubmitting || !state || !city || !upiId}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="inline-block w-4 h-4 mr-2 animate-spin" />
              Submitting...
            </>
          ) : (
            'Submit Claim'
          )}
        </button>
      </form>
    </div>
  );
}
