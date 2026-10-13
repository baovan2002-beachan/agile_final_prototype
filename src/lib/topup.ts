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

/** Restricted view of a balance (HQ never sees the exact figure on this screen). */
export const balanceBand = (n: number) => (n < 100 ? "Below S$100" : n < 300 ? "S$100 to under S$300" : n < 500 ? "S$300 to under S$500" : "S$500 and above");

export type RuleCriteria = Pick<FundRule, "ageMin" | "ageMax" | "minBalance" | "maxBalance" | "schooling" | "schools">;

/** Active accounts matching every criterion: age inclusive, balance in [min, max), schooling status, school (empty = all). */
export function eligibleForRule(rule: RuleCriteria, accounts: Account[]): Account[] {
  return accounts.filter(
    (a) =>
      a.status === "Active" &&
      a.age >= rule.ageMin && a.age <= rule.ageMax &&
      a.balance >= rule.minBalance && a.balance < rule.maxBalance &&
      rule.schooling === a.schooling &&
      (!rule.schools.length || rule.schools.includes(a.school)),
  );
}

export type RuleInput = RuleCriteria & { amount: number };
export type Overlap = { rule: FundRule; ageMin: number; ageMax: number; minBalance: number; maxBalance: number; schools: string[] };

/**
 * Validation errors plus overlap warnings against the other Active rules.
 * Overlap needs shared age, balance range, schooling status AND school scope; it is a warning, never a block.
 * `selfId` is excluded when editing.
 */
export function checkRule(input: RuleInput, others: FundRule[], selfId?: string): { errors: string[]; overlaps: Overlap[] } {
  const { ageMin: a, ageMax: b, minBalance, maxBalance, amount, schools, schooling } = input;
  const errors: string[] = [];
  if (!Number.isInteger(a) || !Number.isInteger(b) || a < 0 || b > 120 || a > b) errors.push("Age range must be whole numbers from 0 to 120, minimum not above maximum.");
  if (!(minBalance >= 0) || !(maxBalance > minBalance)) errors.push("Balance range: minimum must be at least S$0 and maximum greater than minimum.");
  if (!(amount > 0)) errors.push("Top-up amount must be greater than S$0.");
  if (!schooling) errors.push("Select a schooling status.");
  if (errors.length) return { errors, overlaps: [] };
  const overlaps = others
    .filter((r) => r.id !== selfId && r.status === "Active")
    .flatMap((r) => {
      const shared = schools.length && r.schools.length ? schools.filter((s) => r.schools.includes(s)) : schools.length ? schools : r.schools;
      const lo = Math.max(minBalance, r.minBalance);
      const hi = Math.min(maxBalance, r.maxBalance);
      const schoolsMeet = !schools.length || !r.schools.length || shared.length > 0;
      const schoolingMeets = schooling === r.schooling;
      if (a > r.ageMax || b < r.ageMin || !(lo < hi) || !schoolsMeet || !schoolingMeets) return [];
      return [{ rule: r, ageMin: Math.max(a, r.ageMin), ageMax: Math.min(b, r.ageMax), minBalance: lo, maxBalance: hi, schools: shared }];
    });
  return { errors, overlaps };
}

/** Next "R-1004" style id. */
export function nextRuleId(rules: { id: string }[]): string {
  return `R-${rules.reduce((m, r) => Math.max(m, Number(r.id.replace(/\D/g, "")) || 0), 1000) + 1}`;
}
