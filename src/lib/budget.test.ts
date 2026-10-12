import { expect, test } from "vitest";
import { budgetUsage } from "./budget";

test("budgetUsage", () => {
  expect(budgetUsage(2.4e6, 3e6)).toEqual({ pct: 80, over: false, barPct: 80 });
  expect(budgetUsage(120, 100)).toEqual({ pct: 120, over: true, barPct: 100 });
  expect(budgetUsage(5, 0).pct).toBe(0);
});
