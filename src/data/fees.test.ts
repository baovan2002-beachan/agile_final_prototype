import { expect, test } from "vitest";
import { FEE_TYPES, validateName, validateRate, exceedsCeiling } from "./fees";

test("validateRate: positive number, max 2 decimals", () => {
  expect(validateRate("13")).toEqual({ value: 13 });
  expect(validateRate(" 12.50 ")).toEqual({ value: 12.5 });
  expect(validateRate("12.5")).toEqual({ value: 12.5 });
  for (const bad of ["", "   ", "abc", "0", "0.00", "-5", "1.234", "12.505", "1e3", "9".repeat(400)]) {
    expect(validateRate(bad).error, bad).toBeTruthy();
  }
});

test("validateName: required, unique, whitespace-insensitive", () => {
  expect(validateName("", FEE_TYPES)).toBeTruthy();
  expect(validateName("   ", FEE_TYPES)).toBeTruthy();
  expect(validateName("  enrichment ", FEE_TYPES)).toBeTruthy();
  expect(validateName("learning   MATERIALS", FEE_TYPES)).toBeTruthy();
  expect(validateName("School Trip", FEE_TYPES)).toBeUndefined();
});

test("exceedsCeiling: strictly above the citizen ceiling", () => {
  const fee = { id: "x", name: "X", cycle: "term" as const, amount: 60, ceiling: { citizen: 60, pr: 120, international: 240 } };
  expect(exceedsCeiling(fee)).toBe(false); // equal is allowed
  expect(exceedsCeiling({ ...fee, amount: 60.01 })).toBe(true);
  expect(exceedsCeiling({ ...fee, amount: 99, ceiling: undefined })).toBe(false);
});

test("mock data: at least one fee is above its ceiling so the warning is demonstrable", () => {
  expect(FEE_TYPES.some(exceedsCeiling)).toBe(true);
});
