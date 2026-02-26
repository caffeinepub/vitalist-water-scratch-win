/**
 * Weighted reward generator
 * ₹10  → 90.0%
 * ₹20  →  4.0%
 * ₹30  →  3.9%
 * ₹90  →  2.0%
 * ₹100 →  0.1%
 */
const REWARDS: { amount: number; cumulative: number }[] = [
  { amount: 10,  cumulative: 0.900 },
  { amount: 20,  cumulative: 0.940 },
  { amount: 30,  cumulative: 0.979 },
  { amount: 90,  cumulative: 0.999 },
  { amount: 100, cumulative: 1.000 },
];

export function generateReward(): number {
  const rand = Math.random();
  for (const tier of REWARDS) {
    if (rand < tier.cumulative) return tier.amount;
  }
  return 10;
}

export function generateUniqueCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const seg = (len: number) =>
    Array.from({ length: len }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  return `VW-${seg(4)}-${seg(4)}`;
}
