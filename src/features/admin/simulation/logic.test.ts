import { describe, expect, it } from "vitest";
import { SCHOOLS } from "../../../data/schools";
import { effectiveRole, filterSchools, newSessionId, parseSimulating, simulationFor } from "./logic";

const sim = { as: "school", sessionId: "SIM-ABC123", schoolName: "X" } as const;

describe("effectiveRole", () => {
  it("HQ not simulating stays HQ (so /parent/* is still redirected)", () => {
    expect(effectiveRole("hq", null)).toBe("hq");
  });
  it("HQ simulating takes the target role", () => {
    expect(effectiveRole("hq", sim)).toBe("school");
    expect(effectiveRole("hq", { as: "parent", sessionId: "s" })).toBe("parent");
  });
  it("a non-HQ role can never simulate", () => {
    expect(effectiveRole("school", sim)).toBe("school");
    expect(effectiveRole("parent", sim)).toBe("parent");
    expect(effectiveRole(null, sim)).toBeNull();
    expect(simulationFor("school", sim)).toBeNull();
    expect(simulationFor("hq", sim)).toBe(sim);
  });
});

describe("parseSimulating", () => {
  it("accepts a valid value and drops junk", () => {
    expect(parseSimulating(sim)).toEqual(sim);
    expect(parseSimulating({ as: "parent", sessionId: "s", extra: 1 })).toEqual({ as: "parent", sessionId: "s" });
    for (const bad of [null, "x", {}, { as: "hq", sessionId: "s" }, { as: "school", sessionId: "" }, { as: "school" }])
      expect(parseSimulating(bad)).toBeNull();
  });
});

describe("newSessionId / filterSchools", () => {
  it("id looks like SIM-XXXXXX", () => expect(newSessionId(1_700_000_000_000)).toMatch(/^SIM-[0-9A-Z]{6}$/));
  it("search matches name or code, case-insensitive; blank returns all", () => {
    expect(filterSchools(SCHOOLS, "  ")).toHaveLength(SCHOOLS.length);
    expect(filterSchools(SCHOOLS, "greenfield")).toHaveLength(1);
    expect(filterSchools(SCHOOLS, "s002")[0].name).toMatch(/Riverbank/);
    expect(filterSchools(SCHOOLS, "zzz")).toHaveLength(0);
  });
});
