# Specification

## Summary
**Goal:** Fix the runtime error that occurs when the user clicks the "Submit" button on the ClaimForm.

**Planned changes:**
- Diagnose the failure point in the `useSubmitClaim` hook (`useQueries.ts`) and `ClaimForm` component (e.g., undefined actor, wrong argument shape, type mismatch with the Motoko `submitClaim` method).
- Ensure the mutation is invoked with all required fields (`couponCode`, `rewardAmount`, `state`, `city`, `feedback`, `upiId`) using the correct types matching the backend signature.
- Add error handling so backend failures display an inline error message inside the form instead of crashing.
- Show a loading/disabled state on the Submit button while the mutation is in progress.
- Display the `ConfirmationNotification` component and hide the form on successful submission.

**User-visible outcome:** Users can submit the claim form without encountering a runtime error; submission shows a loading indicator, surfaces any errors inline, and on success shows the confirmation screen.
