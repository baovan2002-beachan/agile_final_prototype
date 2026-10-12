export type Cycle = "month" | "term" | "year";
export const CYCLES: { value: Cycle; label: string }[] = [
  { value: "month", label: "Per month" },
  { value: "term", label: "Per term" },
  { value: "year", label: "Per year" },
];
export const cycleLabel = (c: Cycle) => CYCLES.find((x) => x.value === c)!.label;

export type Ceiling = { citizen: number; pr: number; international: number };
export type FeeType = { id: string; name: string; amount: number; cycle: Cycle; ceiling?: Ceiling };

// ASSUMPTION: national ceilings and the "school rate may not exceed the citizen ceiling" rule are invented
// (handoff open question); ceilings are in the same billing cycle as the fee. Enrichment is mocked above its ceiling.
export const FEE_TYPES: FeeType[] = [
  { id: "misc", name: "Miscellaneous", amount: 13, cycle: "month", ceiling: { citizen: 15, pr: 30, international: 60 } },
  { id: "learning", name: "Learning Materials", amount: 55, cycle: "term", ceiling: { citizen: 60, pr: 120, international: 240 } },
  { id: "enrichment", name: "Enrichment", amount: 65, cycle: "term", ceiling: { citizen: 60, pr: 120, international: 240 } },
  { id: "insurance", name: "Student Insurance", amount: 8, cycle: "year", ceiling: { citizen: 10, pr: 20, international: 40 } },
];

export const exceedsCeiling = (f: FeeType) => !!f.ceiling && f.amount > f.ceiling.citizen;

/** Positive number, at most 2 decimals. Returns the parsed value or an error message. */
export function validateRate(raw: string): { value?: number; error?: string } {
  const s = raw.trim();
  if (!s) return { error: "Enter an amount." };
  if (!/^\d+(\.\d{1,2})?$/.test(s)) return { error: "Use a positive number with at most 2 decimals." };
  const value = Number(s);
  return value > 0 ? { value } : { error: "Amount must be greater than 0." };
}

export function validateName(raw: string, existing: FeeType[]): string | undefined {
  const s = raw.trim();
  if (!s) return "Enter a fee name.";
  if (existing.some((f) => f.name.toLowerCase() === s.toLowerCase())) return "A fee type with this name already exists.";
}
