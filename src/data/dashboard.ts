// Mock figures for the Admin dashboard (handoff section 6). All values are invented.

export type Trend = { dir: "up" | "flat" | "down"; pct: number };
export type Stat = { key: "students" | "accounts" | "schools" | "pendingFas"; label: string; value: number; trend: Trend };

export const stats: Stat[] = [
  { key: "students", label: "Total Student", value: 12480, trend: { dir: "up", pct: 2.4 } },
  { key: "accounts", label: "Active Account", value: 9236, trend: { dir: "up", pct: 1.1 } },
  { key: "schools", label: "Total School", value: 186, trend: { dir: "flat", pct: 0 } },
  { key: "pendingFas", label: "Pending FAS Application", value: 342, trend: { dir: "up", pct: 8 } },
];

export const receivedFas = { received: 1284, applicants: 3420, moefas: 962, sbfas: 322, updated: "1 hour ago" };

export const fasByTier = [
  { tier: "Tier 1", count: 612 },
  { tier: "Tier 2", count: 388 },
  { tier: "Tier 3", count: 191 },
  { tier: "Tier 4", count: 93 },
];

export type PaymentStatus = "Paid" | "Upcoming" | "Overdue";
export type Payment = { invoice: string; date: string; amount: number; status: PaymentStatus };

export const payments: Payment[] = [
  { invoice: "INV-260931", date: "12 Oct 2026", amount: 25, status: "Upcoming" },
  { invoice: "INV-260927", date: "08 Oct 2026", amount: 35, status: "Paid" },
  { invoice: "INV-260915", date: "01 Oct 2026", amount: 120, status: "Paid" },
  { invoice: "INV-260902", date: "24 Sep 2026", amount: 65.5, status: "Overdue" },
];

// ASSUMPTION: the 80% alert threshold is a mock rule; budget-exceeded behaviour is an open question.
export const BUDGET_ALERT_PCT = 80;

export const budgets = [
  { name: "MOEFAS", owner: "MOE HQ", used: 2_400_000, budget: 3_000_000 },
  { name: "SBFAS", owner: "School", used: 310_000, budget: 500_000 },
];
export const budgetsUpdated = "1 hour ago";

export const school = {
  name: "Greenfield Secondary School",
  address: "12 Example Road, Singapore 000000",
  phone: "+65 6000 0000",
  students: 1120,
  classes: 38,
};

export const topUps = {
  period: "Jan - Apr 2026",
  months: [
    { month: "JAN", name: "January", amount: 1_200_000 },
    { month: "FEB", name: "February", amount: 850_000 },
    { month: "MAR", name: "March", amount: 1_460_000 },
    { month: "APR", name: "April", amount: 920_000 },
  ],
};
