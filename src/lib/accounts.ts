import type { Level, Student } from "../data/students";

// ASSUMPTION: age is inferred from level (P1 = 7 ... Sec 4 = 16); the mock students carry no date of birth.
const AGE: Record<Level, number> = { P1: 7, P2: 8, P3: 9, P4: 10, P5: 11, P6: 12, "Sec 1": 13, "Sec 2": 14, "Sec 3": 15, "Sec 4": 16 };
export const ACCOUNT_OPENS_AT = 7;
export const ACCOUNT_CLOSES_AT = 16;

export const ageForLevel = (l: Level) => AGE[l];

/** Req 1: opens when the child turns 7, closes at 16 (balance goes to CPF by default). */
export function accountStatus(l: Level): "Not yet open" | "Active" | "Closes this year" {
  const a = AGE[l];
  return a < ACCOUNT_OPENS_AT ? "Not yet open" : a >= ACCOUNT_CLOSES_AT ? "Closes this year" : "Active";
}

export type LedgerEntry = { date: string; description: string; amount: number };

/** Mock ledger that always sums to the student's balance (computed in cents). */
export function ledgerFor(s: Pick<Student, "id" | "balance">): LedgerEntry[] {
  const balance = Math.round(s.balance * 100);
  const fees = [
    { date: "2026-02-03", description: "Miscellaneous fee (Term 1)", cents: 1300 },
    { date: "2026-02-03", description: "Learning materials (Term 1)", cents: 5500 },
  ];
  const spent = fees.reduce((t, f) => t + f.cents, 0);
  return [
    { date: "2026-01-02", description: "Annual MOE top-up", amount: (balance + spent) / 100 },
    ...fees.map((f) => ({ date: f.date, description: f.description, amount: -f.cents / 100 })),
  ];
}
