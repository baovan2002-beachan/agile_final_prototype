import type { Level } from "./students";

export type FeeComponent = { name: string; amount: number };
/** A school-defined fee: a named bundle of components, optionally for one level. `school` is the school code. */
export type FeeType = { id: string; school: string; name: string; level?: Level; components: FeeComponent[]; updated: string };

export type ChargeStatus = "outstanding" | "overdue" | "paid";
export type ChargeComponent = FeeComponent & { subsidy?: number };
/** One fee issued to one student for one term. Components are copied from the fee type when issued. */
export type Charge = {
  id: string; studentId: string; ftId: string; title: string; term: string;
  issued: string; due: string; status: ChargeStatus; paidOn?: string; components: ChargeComponent[];
};

export const TERMS = ["2026 Term 4", "2027 Term 1", "2026 Term 3"];
/** Default due date per term (no manual field). */
export const TERM_DUE: Record<string, string> = { "2026 Term 4": "2026-11-13", "2027 Term 1": "2027-02-12", "2026 Term 3": "2026-09-18" };

// ASSUMPTION: invented fee types and amounts (mock data). Schools define their own; HQ views them read-only.
export const FEE_TYPES: FeeType[] = [
  { id: "FT-01", school: "S001", name: "School Fees (Secondary)", updated: "2026-09-28", components: [{ name: "Miscellaneous", amount: 13 }, { name: "Learning Materials", amount: 55 }, { name: "Enrichment", amount: 65 }, { name: "Student Insurance", amount: 8 }] },
  { id: "FT-02", school: "S002", name: "School Fees (Primary)", updated: "2026-09-28", components: [{ name: "Miscellaneous", amount: 10 }, { name: "Learning Materials", amount: 45 }, { name: "Student Insurance", amount: 8 }] },
  { id: "FT-03", school: "S001", name: "Supplementary Fees", level: "Sec 1", updated: "2026-08-20", components: [{ name: "Co-curricular Attire", amount: 70 }, { name: "Camp Fee", amount: 50 }] },
];
