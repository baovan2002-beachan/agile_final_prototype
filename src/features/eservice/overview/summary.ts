import type { Invoice } from "../../../data/parent";

const round = (n: number) => Math.round(n * 100) / 100;
const sum = (xs: Invoice[]) => round(xs.reduce((s, i) => s + i.amount, 0));
const open = (i: Invoice) => i.status !== "paid";

export const outstanding = (invoices: Invoice[]) => sum(invoices.filter(open));
export const childOutstanding = (invoices: Invoice[], childId: string) => sum(invoices.filter((i) => open(i) && i.childId === childId));
// ASSUMPTION: "paid this year" = all paid invoices in the mock data (all dated 2026).
export const paidThisYear = (invoices: Invoice[]) => sum(invoices.filter((i) => i.status === "paid"));

/** Earliest upcoming (not overdue) due date, with the total of every invoice due that day. */
export function nextDue(invoices: Invoice[]): { date: string; amount: number; count: number } | null {
  const upcoming = invoices.filter((i) => i.status === "unpaid");
  if (!upcoming.length) return null;
  const date = upcoming.map((i) => i.dueDate).sort()[0];
  const same = upcoming.filter((i) => i.dueDate === date);
  return { date, amount: sum(same), count: same.length };
}

export type ProfileForm = { address: string; mailingAddress: string; contact: string };

// ASSUMPTION: parents may edit only address, mailing address and contact number (editable-fields rule is an open question).
// Address rule: at least 5 chars and a 6-digit Singapore postal code. Contact: Singapore number, 8 digits starting 6, 8 or 9, optional +65.
export function validateProfile(f: ProfileForm): Partial<Record<keyof ProfileForm, string>> {
  const errors: Partial<Record<keyof ProfileForm, string>> = {};
  const addr = (v: string) => (v.trim().length < 5 ? "Enter the full address." : !/\b\d{6}\b/.test(v) ? "Include the 6-digit postal code." : undefined);
  const a = addr(f.address);
  if (a) errors.address = a;
  const m = addr(f.mailingAddress);
  if (m) errors.mailingAddress = m;
  if (!/^[689]\d{7}$/.test(f.contact.replace(/^\+65/, "").replace(/\s/g, ""))) errors.contact = "Enter a Singapore number, for example +65 9123 4567.";
  return errors;
}
