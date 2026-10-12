import { splitSettlement } from "../../../lib/settlement";
import type { Child, Invoice } from "../../../data/parent";

// ASSUMPTION: two payment modes. "account-first" spends each child's Education Account first and sends the
// remainder to the card/bank gateway; "gateway" pays everything through the gateway. A child's account only pays that child's invoices.
export type Mode = "account-first" | "gateway";
export type Line = { child: Child; total: number; fromAccount: number; fromGateway: number };
export type Summary = { lines: Line[]; total: number; fromAccount: number; fromGateway: number };

export const isPayable = (i: Invoice) => i.status !== "paid";
const cents = (n: number) => Math.round(n * 100) / 100;
const sum = (xs: number[]) => cents(xs.reduce((a, b) => a + b, 0));

export function settle(invoices: Invoice[], children: Child[], ids: ReadonlySet<string>, mode: Mode): Summary {
  const lines = children
    .map((child) => {
      const total = sum(invoices.filter((i) => i.childId === child.id && isPayable(i) && ids.has(i.id)).map((i) => i.amount));
      const s = mode === "gateway" ? { fromAccount: 0, fromGateway: total } : splitSettlement(total, child.educationBalance);
      return { child, total, fromAccount: cents(s.fromAccount), fromGateway: cents(s.fromGateway) };
    })
    .filter((l) => l.total > 0);
  return {
    lines,
    total: sum(lines.map((l) => l.total)),
    fromAccount: sum(lines.map((l) => l.fromAccount)),
    fromGateway: sum(lines.map((l) => l.fromGateway)),
  };
}

/** Marks the selected payable invoices paid and deducts the Education Account share from each child's balance. */
export function applyPayment(invoices: Invoice[], children: Child[], ids: ReadonlySet<string>, mode: Mode) {
  const { lines } = settle(invoices, children, ids, mode);
  const spent = new Map(lines.map((l) => [l.child.id, l.fromAccount]));
  return {
    invoices: invoices.map((i) => (isPayable(i) && ids.has(i.id) ? { ...i, status: "paid" as const } : i)),
    children: children.map((c) => ({ ...c, educationBalance: cents(c.educationBalance - (spent.get(c.id) ?? 0)) })),
  };
}
