import { useState } from 'react';
import { useSubmitClaim } from '../hooks/useQueries';

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
  'Delhi', 'Jammu & Kashmir', 'Ladakh', 'Chandigarh', 'Puducherry',
];

export default function ClaimForm({ couponCode, rewardAmount, onSuccess }: ClaimFormProps) {
  const [state, setState] = useState('');
  const [city, setCity] = useState('');
  const [feedback, setFeedback] = useState('');
  const [upiId, setUpiId] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { mutate: submitClaim, isPending, isError, error } = useSubmitClaim();

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!state) newErrors.state = 'Please select your state.';
    if (!city.trim()) newErrors.city = 'Please enter your city.';
    if (!feedback.trim()) newErrors.feedback = 'Please share your feedback.';
    if (!upiId.trim()) newErrors.upiId = 'Please enter your UPI ID.';
    else if (!/^[\w.\-_]{2,256}@[a-zA-Z]{2,64}$/.test(upiId.trim())) {
      newErrors.upiId = 'Enter a valid UPI ID (e.g. name@upi).';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    submitClaim(
      { couponCode, rewardAmount, state, city: city.trim(), feedback: feedback.trim(), upiId: upiId.trim() },
      { onSuccess: () => onSuccess() }
    );
  };

  return (
    <div className="claim-form-section">
      <div className="claim-form-card">
        <div className="claim-form-header">
          <div className="claim-form-icon">📋</div>
          <h2 className="claim-form-title">Claim Your ₹{rewardAmount}</h2>
          <p className="claim-form-subtitle">Fill in your details to receive the money in your account</p>
        </div>

        <form onSubmit={handleSubmit} className="claim-form-body" noValidate>
          {/* State */}
          <div className="form-field">
            <label className="form-label">State <span className="form-required">*</span></label>
            <select
              className={`form-select ${errors.state ? 'form-input-error' : ''}`}
              value={state}
              onChange={(e) => { setState(e.target.value); setErrors(p => ({ ...p, state: '' })); }}
              disabled={isPending}
            >
              <option value="">— Select your state —</option>
              {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            {errors.state && <span className="form-error-msg">{errors.state}</span>}
          </div>

          {/* City */}
          <div className="form-field">
            <label className="form-label">City <span className="form-required">*</span></label>
            <input
              type="text"
              className={`form-input ${errors.city ? 'form-input-error' : ''}`}
              placeholder="Enter your city"
              value={city}
              onChange={(e) => { setCity(e.target.value); setErrors(p => ({ ...p, city: '' })); }}
              disabled={isPending}
            />
            {errors.city && <span className="form-error-msg">{errors.city}</span>}
          </div>

          {/* UPI ID */}
          <div className="form-field">
            <label className="form-label">UPI ID <span className="form-required">*</span></label>
            <input
              type="text"
              className={`form-input ${errors.upiId ? 'form-input-error' : ''}`}
              placeholder="yourname@upi"
              value={upiId}
              onChange={(e) => { setUpiId(e.target.value); setErrors(p => ({ ...p, upiId: '' })); }}
              disabled={isPending}
            />
            {errors.upiId && <span className="form-error-msg">{errors.upiId}</span>}
          </div>

          {/* Feedback */}
          <div className="form-field">
            <label className="form-label">Feedback <span className="form-required">*</span></label>
            <textarea
              className={`form-textarea ${errors.feedback ? 'form-input-error' : ''}`}
              placeholder="How was your experience with Vitalis Water?"
              rows={3}
              value={feedback}
              onChange={(e) => { setFeedback(e.target.value); setErrors(p => ({ ...p, feedback: '' })); }}
              disabled={isPending}
            />
            {errors.feedback && <span className="form-error-msg">{errors.feedback}</span>}
          </div>

          {isError && (
            <div className="form-server-error">
              ⚠️ {error?.message || 'Something went wrong. Please try again.'}
            </div>
          )}

          <button type="submit" className="form-submit-btn" disabled={isPending}>
            {isPending ? (
              <span className="form-submit-loading">
                <span className="form-spinner" />
                Submitting…
              </span>
            ) : (
              <>💸 Submit &amp; Claim ₹{rewardAmount}</>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
