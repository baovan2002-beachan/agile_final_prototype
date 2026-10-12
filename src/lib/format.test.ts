import { expect, test } from "vitest";
import { formatSGD } from "./format";

test("formatSGD", () => {
  expect(formatSGD(2400000, { compact: true })).toBe("S$2.40M");
  expect(formatSGD(310000, { compact: true })).toBe("S$310K");
  expect(formatSGD(950, { compact: true })).toBe("S$950");
  expect(formatSGD(1284.5)).toBe("S$1,284.50");
});
