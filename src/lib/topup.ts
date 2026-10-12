import type { Account } from "../data/topup";

export type TopUpRule = {
  ageMin: number;
  ageMax: number;
  citizenOnly: boolean;
  enrolledOnly: boolean;
  balanceMin: number;
  balanceMax: number;
};

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
