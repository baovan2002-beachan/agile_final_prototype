import { expect, test } from "vitest";
import { FEE_TYPES, validateName, validateRate, exceedsCeiling } from "./fees";

test("validateRate: positive number, max 2 decimals", () => {
  expect(validateRate("13")).toEqual({ value: 13 });
  expect(validateRate(" 12.50 ")).toEqual({ value: 12.5 });
  for (const bad of ["", "abc", "0", "-5", "1.234", "1e3"]) expect(validateRate(bad).error).toBeTruthy();
});

test("validateName: required and unique (case-insensitive)", () => {
  expect(validateName("", FEE_TYPES)).toBeTruthy();
  expect(validateName("  enrichment ", FEE_TYPES)).toBeTruthy();
  expect(validateName("School Trip", FEE_TYPES)).toBeUndefined();
});

test("exceedsCeiling compares against the citizen ceiling", () => {
  const enrichment = FEE_TYPES.find((f) => f.id === "enrichment")!;
  expect(exceedsCeiling(enrichment)).toBe(true);
  expect(exceedsCeiling(FEE_TYPES.find((f) => f.id === "misc")!)).toBe(false);
  expect(exceedsCeiling({ ...enrichment, ceiling: undefined })).toBe(false);
});
