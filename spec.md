# Specification

## Summary
**Goal:** Fix the admin authorization error in the backend and ensure claim submission data is fully stored and visible in the admin panel.

**Planned changes:**
- Remove or disable the caller-identity-based admin guard in `backend/main.mo` so that `getSubmissions`, `getStats`, and `markAsRedeemed` are accessible without returning an "Unauthorized" error.
- Audit and fix `backend/main.mo` to ensure the `Submission` record type includes all fields (couponCode, rewardAmount, state, city, upiId, feedback, timestamp, status) and that `submitClaim` writes all fields to stable storage.
- Audit and fix `useQueries.ts` to ensure the `useSubmitClaim` mutation passes all required fields with correct types matching the Motoko function signature.
- On successful claim submission, invalidate the React Query submissions cache so `AdminPanel.tsx` re-fetches fresh data.

**User-visible outcome:** After a user submits the claim form, all submission details (coupon code, reward amount, state, city, UPI ID, feedback, timestamp, status) immediately appear in the admin panel without any authorization errors.
