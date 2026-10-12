export type Account = { id: string; name: string; age: number; citizen: boolean; enrolled: boolean; balance: number };

export type Schedule = "now" | "monthly" | "quarterly" | "yearly";

export type Execution = { id: string; title: string; fundTag: string; schedule: Schedule; eligible: number; amount: number; total: number; date: string; by: string };

const FIRST = ["Ethan", "Chloe", "Marcus", "Aisha", "Jun Wei", "Priya", "Daniel", "Siti", "Isaac", "Mei Ling", "Arjun", "Hannah", "Wei Jie", "Nur", "Caleb", "Sophia", "Ryan", "Keerthi", "Zhi Hao", "Olivia"];
const LAST = ["Tan", "Lim", "Wong", "Rahman", "Chua", "Nair", "Ong", "Goh", "Lee", "Ng", "Koh", "Teo"];

/** 60 deterministic mock accounts (no randomness so tests and screenshots are stable). */
export const ACCOUNTS: Account[] = Array.from({ length: 60 }, (_, i) => ({
  id: `EA-${String(2001 + i).padStart(5, "0")}`,
  name: `${FIRST[i % FIRST.length]} ${LAST[(i * 7) % LAST.length]}`,
  age: 5 + ((i * 5) % 13), // 5..17
  citizen: i % 6 !== 5, // about 1 in 6 is non-citizen
  enrolled: i % 8 !== 3, // 1 in 8 is not enrolled
  balance: 20 + ((i * 137) % 1481) + (i % 4) * 0.5, // S$20 .. ~S$1,500
}));

export const PAST_EXECUTIONS: Execution[] = [
  { id: "TU-0005", title: "Primary cohort annual top-up", fundTag: "Annual Education Top-Up", schedule: "yearly", eligible: 21, amount: 200, total: 4200, date: "2026-01-05", by: "HQ Officer" },
  { id: "TU-0006", title: "Edusave Contribution Q3", fundTag: "Edusave Contribution", schedule: "quarterly", eligible: 34, amount: 150, total: 5100, date: "2026-07-01", by: "HQ Officer" },
  { id: "TU-0007", title: "Pioneer cohort ad-hoc grant", fundTag: "Ad-hoc Grant", schedule: "now", eligible: 12, amount: 500, total: 6000, date: "2026-08-14", by: "HQ Officer" },
];

export const FUND_TAGS = ["Annual Education Top-Up", "Edusave Contribution", "Ad-hoc Grant", "Bursary Supplement"];
