import type { Account, FundRule } from "../data/topup";

export type TopUpRule = {
  ageMin: number;
  ageMax: number;
  citizenOnly: boolean;
  enrolledOnly: boolean;
  balanceMin: number;
  balanceMax: number;
};

/** count * amount in integer cents, so 3 x S$0.10 is exactly S$0.30. `amount` must already be at most 2 decimals (see parseAmount). */
export function totalFunds(count: number, amount: number): number {
  return (Math.round(amount * 100) * count) / 100;
}

/** Next "TU-0001" style id from the highest existing number. */
export function nextExecutionId(rows: { id: string }[]): string {
  const max = rows.reduce((m, r) => Math.max(m, Number(r.id.replace(/\D/g, "")) || 0), 0);
  return `TU-${String(max + 1).padStart(4, "0")}`;
}

/** Accounts matching every rule. Age and balance bounds are inclusive; flags only exclude when on. */
export function eligibleAccounts(rule: TopUpRule, accounts: Account[]): Account[] {
  return accounts.filter(
    (a) =>
      a.age >= rule.ageMin &&
      a.age <= rule.ageMax &&
      (!rule.citizenOnly || a.citizen) &&
      (!rule.enrolledOnly || a.enrolled) &&
      a.balance >= rule.balanceMin &&
      a.balance <= rule.balanceMax,
  );
}

/** Accounts a saved rule covers: age inclusive, balance strictly below the limit, school in the rule. */
export function eligibleForRule(rule: Pick<FundRule, "ageMin" | "ageMax" | "balanceBelow" | "schools">, accounts: Account[]): Account[] {
  return accounts.filter((a) => a.age >= rule.ageMin && a.age <= rule.ageMax && a.balance < rule.balanceBelow && rule.schools.includes(a.school));
}

export type RuleInput = { ageMin: number; ageMax: number; balanceBelow: number; amount: number; schools: string[] };
export type Overlap = { rule: FundRule; ageMin: number; ageMax: number; schools: string[]; balanceBelow: number };

/**
 * Validation errors plus overlap warnings against the other Active rules.
 * Overlap needs shared age AND a shared school; it is a warning, never a block. `selfId` is excluded when editing.
 */
export function checkRule(input: RuleInput, others: FundRule[], selfId?: string): { errors: string[]; overlaps: Overlap[] } {
  const { ageMin: a, ageMax: b, balanceBelow, amount, schools } = input;
  const errors: string[] = [];
  if (!Number.isInteger(a) || !Number.isInteger(b) || a < 0 || b > 120 || a > b) errors.push("Age range must be whole numbers, minimum not above maximum.");
  if (!(balanceBelow > 0)) errors.push("Balance limit must be greater than S$0.");
  if (!(amount > 0)) errors.push("Top-up amount must be greater than S$0.");
  if (!schools.length) errors.push("Select at least one school.");
  if (errors.length) return { errors, overlaps: [] };
  const overlaps = others
    .filter((r) => r.id !== selfId && r.status === "Active")
    .flatMap((r) => {
      const shared = schools.filter((s) => r.schools.includes(s));
      if (a > r.ageMax || b < r.ageMin || !shared.length) return [];
      return [{ rule: r, ageMin: Math.max(a, r.ageMin), ageMax: Math.min(b, r.ageMax), schools: shared, balanceBelow: Math.min(balanceBelow, r.balanceBelow) }];
    });
  return { errors, overlaps };
}

/** Next "R-1004" style id. */
export function nextRuleId(rules: { id: string }[]): string {
  return `R-${rules.reduce((m, r) => Math.max(m, Number(r.id.replace(/\D/g, "")) || 0), 1000) + 1}`;
}
