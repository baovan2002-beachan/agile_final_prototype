import { expect, test } from "vitest";
import { children, invoices, ledgerBalance, transactions } from "../../../data/parent";
import { childOutstanding, nextDue, outstanding, paidThisYear, validateProfile } from "./summary";

test("outstanding is the sum of unpaid and overdue invoices", () => {
  expect(outstanding(invoices)).toBe(352);
  expect(childOutstanding(invoices, "c1")).toBe(53);
  expect(childOutstanding(invoices, "c2")).toBe(299);
});

test("paid this year sums paid invoices", () => {
  expect(paidThisYear(invoices)).toBe(389.5);
});

test("nextDue groups unpaid invoices on the earliest upcoming date and skips overdue", () => {
  expect(nextDue(invoices)).toEqual({ date: "2026-10-31", amount: 82, count: 2 });
  expect(nextDue([])).toBeNull();
});

test("every paid invoice has a matching payment transaction of the same amount", () => {
  for (const inv of invoices.filter((i) => i.status === "paid")) {
    const tx = transactions.find((t) => t.invoiceId === inv.id);
    expect(tx?.amount).toBe(-inv.amount);
  }
});

test("education balances equal the ledger, with the Payments cases still demonstrable", () => {
  for (const c of children) expect(c.educationBalance).toBe(ledgerBalance(transactions, c.id));
  const [ethan, chloe] = children;
  expect(ethan.educationBalance).toBe(0); // balance 0
  expect(chloe.educationBalance).toBe(120); // partial: below her outstanding S$299
  expect(chloe.educationBalance).toBeLessThan(childOutstanding(invoices, "c2"));
  expect(chloe.educationBalance).toBeGreaterThan(54); // over: covers INV-2610-022 alone
});

test("validateProfile", () => {
  const ok = { address: "Blk 1 Bishan St 23, Singapore 570214", mailingAddress: "Blk 1 Bishan St 23, Singapore 570214", contact: "+65 9123 4567" };
  expect(validateProfile(ok)).toEqual({});
  expect(Object.keys(validateProfile({ address: "", mailingAddress: "x", contact: "12345" })).sort()).toEqual(["address", "contact", "mailingAddress"]);
  expect(validateProfile({ ...ok, contact: "91234567" })).toEqual({});
  expect(validateProfile({ ...ok, contact: "5123 4567" }).contact).toBeTruthy();
  expect(validateProfile({ ...ok, contact: "+65 9123-4567" })).toEqual({});
  expect(validateProfile({ ...ok, contact: "3123 4567" })).toEqual({});
  expect(validateProfile({ ...ok, contact: "+65 5123 4567" }).contact).toBeTruthy();
  expect(validateProfile({ ...ok, address: "Blk 1 Bishan St 23" }).address).toBeTruthy();
});
