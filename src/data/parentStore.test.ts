import { describe, expect, it } from "vitest";
import { childOutstanding, nextDue, outstanding } from "../features/eservice/overview/summary";
import { ledgerBalance, MOCK_TODAY } from "./parent";
import { initialParentState as s0, parentReducer, type ParentAction } from "./parentStore";

const pay = (ids: string[], mode: "account-first" | "gateway" = "account-first"): ParentAction => ({ type: "pay", ids, mode, date: MOCK_TODAY });
const status = (s: typeof s0, id: string) => s.invoices.find((i) => i.id === id)!.status;

describe("parentReducer pay", () => {
  it("marks invoices paid and drops outstanding and next due", () => {
    const s = parentReducer(s0, pay(["INV-2610-021", "INV-2610-022"]));
    expect(status(s, "INV-2610-021")).toBe("paid");
    expect(status(s, "INV-2610-022")).toBe("paid");
    expect(outstanding(s.invoices)).toBe(outstanding(s0.invoices) - 82);
    expect(nextDue(s.invoices)).toEqual({ date: "2026-11-14", amount: 25, count: 1 });
  });

  it("debits the account first and sends the rest to the card, as separate ledger rows", () => {
    // Chloe (S$120): INV-2609-014 S$85 then INV-2611-009 S$160 -> S$120 from account, S$125 by card.
    const s = parentReducer(s0, pay(["INV-2609-014", "INV-2611-009"]));
    expect(s.children.find((c) => c.id === "c2")!.educationBalance).toBe(0);
    const rows = s.transactions.slice(0, s.transactions.length - s0.transactions.length);
    expect(rows.every((r) => r.date === MOCK_TODAY && r.amount < 0)).toBe(true);
    for (const id of ["INV-2609-014", "INV-2611-009"]) {
      const amount = s0.invoices.find((i) => i.id === id)!.amount;
      expect(rows.filter((r) => r.invoiceId === id).reduce((t, r) => t + r.amount, 0)).toBeCloseTo(-amount, 2);
    }
    expect(new Set(s.transactions.map((t) => t.id)).size).toBe(s.transactions.length);
  });

  it("keeps every balance equal to the ledger", () => {
    for (const mode of ["account-first", "gateway"] as const) {
      const s = parentReducer(s0, pay(["INV-2610-022", "INV-2611-009", "INV-2611-005"], mode));
      for (const c of s.children) expect(c.educationBalance).toBe(ledgerBalance(s.transactions, c.id));
    }
  });

  it("balance 0 (Ethan) goes fully to the card; gateway mode never touches the account", () => {
    const e = parentReducer(s0, pay(["INV-2611-005"]));
    expect(e.children.find((c) => c.id === "c1")!.educationBalance).toBe(0);
    expect(e.transactions[0]).toMatchObject({ childId: "c1", amount: -25, method: "Card" });
    const g = parentReducer(s0, pay(["INV-2610-022"], "gateway"));
    expect(g.children.find((c) => c.id === "c2")!.educationBalance).toBe(120);
    expect(g.transactions[0].method).toBe("Card");
  });

  it("ignores unknown and already-paid ids, and does not mutate the previous state", () => {
    const before = JSON.stringify(s0);
    const s = parentReducer(s0, pay(["INV-2601-003", "nope"]));
    expect(s.transactions).toHaveLength(s0.transactions.length);
    expect(outstanding(s.invoices)).toBe(outstanding(s0.invoices));
    expect(JSON.stringify(s0)).toBe(before);
  });

  it("paying everything leaves nothing outstanding", () => {
    const s = parentReducer(s0, pay(s0.invoices.map((i) => i.id)));
    expect(outstanding(s.invoices)).toBe(0);
    expect(childOutstanding(s.invoices, "c2")).toBe(0);
  });
});

describe("parentReducer saveProfile", () => {
  it("merges only the editable fields", () => {
    const s = parentReducer(s0, { type: "saveProfile", form: { address: "1 New Road, Singapore 111111", mailingAddress: "same", contact: "+65 9000 0000" } });
    expect(s.profile).toMatchObject({ name: s0.profile.name, nric: s0.profile.nric, address: "1 New Road, Singapore 111111", contact: "+65 9000 0000" });
  });
});
