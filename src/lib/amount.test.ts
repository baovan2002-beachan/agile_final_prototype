import { describe, expect, it } from "vitest";
import { MAX_AMOUNT, parseAmount } from "./amount";

describe("parseAmount", () => {
  it.each([
    ["15,000,000", 15000000],
    ["12.34", 12.34],
    ["S$ 100", 100],
    ["007", 7],
    ["1,000.5", 1000.5],
    ["10000000000", MAX_AMOUNT],
  ])("accepts %s", (raw, value) => {
    expect(parseAmount(raw)).toEqual({ value });
  });

  it.each(["12.345", "-5", "", "0", "0.00", "1e9", ".5", "5.", "1,00", "1,5", "1,2,3", "abc"])("rejects %s", (raw) => {
    expect(parseAmount(raw)).toHaveProperty("error");
  });

  it("rejects above the maximum and names it", () => {
    const r = parseAmount("10000000000.01");
    expect(r).toHaveProperty("error");
    expect((r as { error: string }).error).toMatch(/10,000,000,000/);
  });
});
