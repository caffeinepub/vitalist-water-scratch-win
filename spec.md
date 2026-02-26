# Specification

## Summary
**Goal:** Update the scratch card reward system to include a "Better Luck Next Time" outcome with a 40% probability, and handle this outcome gracefully throughout the UI.

**Planned changes:**
- Update `rewardGenerator.ts` to use the new probability distribution: 40% ₹10, 40% Better Luck Next Time, 18% ₹20, 0.01% ₹100, ~1.99% ₹30, returning a discriminated type (numeric reward or `better_luck` sentinel)
- Update `ScratchCard.tsx` to display "Better Luck Next Time!" text on the revealed card face when the outcome is `better_luck`
- Update `ScratchPage.tsx` to suppress confetti, RewardReveal section, and ClaimForm when the outcome is `better_luck`
- Update `RewardReveal.tsx` to handle the `better_luck` case (not rendered for non-monetary outcomes)
- Show a friendly consolation card with the unique coupon code (VW-XXXX-XXXX) when the outcome is `better_luck`

**User-visible outcome:** When a user scratches a card and gets the "Better Luck Next Time" result, they see a consolation message with their coupon code instead of a reward amount, with no claim form or confetti. Monetary reward outcomes continue to work as before.
