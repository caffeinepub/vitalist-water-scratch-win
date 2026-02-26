/**
 * Weighted reward generator
 * ₹10            → 40.00%
 * Better Luck    → 40.00%
 * ₹20            → 18.00%
 * ₹30            →  1.99%
 * ₹100           →  0.01%
 */

export type RewardResult =
  | { type: 'reward'; amount: number }
  | { type: 'better_luck' };

// Cumulative thresholds (must sum to 1.0000)
// 0.0000 – 0.4000 → ₹10         (40%)
// 0.4000 – 0.8000 → better_luck  (40%)
// 0.8000 – 0.9800 → ₹20         (18%)
// 0.9800 – 0.9999 → ₹30         (~1.99%)
// 0.9999 – 1.0000 → ₹100        (0.01%)

export function generateReward(): RewardResult {
  const rand = Math.random();

  if (rand < 0.4000) return { type: 'reward', amount: 10 };
  if (rand < 0.8000) return { type: 'better_luck' };
  if (rand < 0.9800) return { type: 'reward', amount: 20 };
  if (rand < 0.9999) return { type: 'reward', amount: 30 };
  return { type: 'reward', amount: 100 };
}

export function generateUniqueCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const seg = (len: number) =>
    Array.from({ length: len }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  return `VW-${seg(4)}-${seg(4)}`;
}
