# Specification

## Summary
**Goal:** Professionally redesign the Vitalist Water Scratch & Win app with a new logo, premium UI, updated reward probabilities, a claim form, confirmation animation, and an admin panel.

**Planned changes:**
- Replace the existing logo/header with the uploaded Vitalis Water brand logo (`vitalis-logo.png`), displayed prominently at the top
- Overhaul the visual design to a premium level: deep ocean-to-light-blue gradient background, glassmorphism card panels, modern sans-serif typography, gradient buttons with glow effects, and micro-animations
- Update reward probabilities: ₹10 (90%), ₹20 (4%), ₹30 (3.9%), ₹90 (2%), ₹100 (0.1%)
- After reward reveal, show a "Click to Claim Your Reward" button that reveals a claim form with State, City, Feedback, and UPI ID fields (all required), styled with the glassmorphism theme
- On claim form submission, save the entry (coupon code, reward amount, state, city, feedback, UPI ID, timestamp) to the Motoko backend; expose query methods to retrieve all submissions and to look up by coupon code
- After successful form submission, display an animated full-screen/overlay confirmation notification: "Money will be in your account soon!" with a celebration animation (animated checkmark or coins), scale-up/slide-up entrance, using blue, white, and gold brand colors
- Add a password-protected Admin Panel at `/admin` (password: `vitalis2024`) showing a table of all claim submissions (coupon code, reward, state, city, UPI ID, feedback, timestamp), coupon code search/filter, total submission count, and reward amount breakdown; accessible via a discrete footer link

**User-visible outcome:** Users see a polished premium-branded scratch & win experience, can claim their reward via a form, and receive an animated confirmation. Admins can log in to a protected panel to review all submitted claims.
