export const MAX_AMOUNT = 1e10;

const SHAPE = /^(\d{1,3}(,\d{3})+|\d+)(\.\d{1,2})?$/; // plain digits, or correctly grouped thousands

/** Parses a positive S$ amount (max 2 decimals, optional "S$" prefix and thousands commas). */
export function parseAmount(raw: string): { value: number } | { error: string } {
  const s = raw.trim().replace(/^S\$\s*/i, "");
  if (!SHAPE.test(s)) return { error: "Enter an amount greater than 0, for example 125000 (max 2 decimals)" };
  const value = Number(s.replace(/,/g, ""));
  if (!(value > 0)) return { error: "Enter an amount greater than 0" };
  if (value > MAX_AMOUNT) return { error: "Amount cannot exceed S$10,000,000,000" };
  return { value };
}
