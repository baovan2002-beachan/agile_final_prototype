import { describe, expect, it } from "vitest";
import { STUDENTS } from "../data/students";
import { accountStatus, ledgerFor } from "./accounts";

describe("accounts", () => {
  it("opens at 7 and closes at 16", () => {
    expect(accountStatus("P1")).toBe("Active");
    expect(accountStatus("Sec 3")).toBe("Active");
    expect(accountStatus("Sec 4")).toBe("Closes this year");
  });
  it("ledger always sums to the balance", () => {
    for (const s of STUDENTS) {
      const sum = Math.round(ledgerFor(s).reduce((t, e) => t + e.amount * 100, 0));
      expect(sum).toBe(Math.round(s.balance * 100));
    }
  });
});
