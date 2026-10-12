import { describe, expect, it } from "vitest";
import { formatSGD } from "../lib/format";
import { fasByTier, receivedFas, topUps } from "./dashboard";

describe("dashboard mock data is internally consistent", () => {
  it("MOEFAS + SBFAS equals received", () => {
    expect(receivedFas.moefas + receivedFas.sbfas).toBe(1284);
    expect(receivedFas.moefas + receivedFas.sbfas).toBe(receivedFas.received);
  });

  it("tiers sum to received", () => {
    expect(fasByTier.reduce((s, t) => s + t.count, 0)).toBe(receivedFas.received);
  });

  it("top-up months sum to S$4.43M", () => {
    expect(formatSGD(topUps.months.reduce((s, m) => s + m.amount, 0), { compact: true })).toBe("S$4.43M");
  });

  it("received / applicants is 37.5%", () => {
    expect(((receivedFas.received / receivedFas.applicants) * 100).toFixed(1)).toBe("37.5");
  });
});
