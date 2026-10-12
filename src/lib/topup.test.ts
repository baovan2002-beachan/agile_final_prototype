import { describe, expect, test } from "vitest";
import { eligibleAccounts, type TopUpRule } from "./topup";
import type { Account } from "../data/topup";

const acc = (id: string, o: Partial<Account> = {}): Account => ({ id, name: id, age: 10, citizen: true, enrolled: true, balance: 100, ...o });
const rule: TopUpRule = { ageMin: 7, ageMax: 12, citizenOnly: false, enrolledOnly: false, balanceMin: 0, balanceMax: 500 };
const ids = (r: Account[]) => r.map((a) => a.id);

describe("eligibleAccounts", () => {
  test("excludes ages outside the range, bounds inclusive", () => {
    const list = [acc("young", { age: 6 }), acc("min", { age: 7 }), acc("max", { age: 12 }), acc("old", { age: 13 })];
    expect(ids(eligibleAccounts(rule, list))).toEqual(["min", "max"]);
  });
  test("citizenOnly excludes non-citizens; ignored when off", () => {
    const list = [acc("c"), acc("n", { citizen: false })];
    expect(ids(eligibleAccounts({ ...rule, citizenOnly: true }, list))).toEqual(["c"]);
    expect(ids(eligibleAccounts(rule, list))).toEqual(["c", "n"]);
  });
  test("enrolledOnly excludes non-enrolled; ignored when off", () => {
    const list = [acc("e"), acc("x", { enrolled: false })];
    expect(ids(eligibleAccounts({ ...rule, enrolledOnly: true }, list))).toEqual(["e"]);
    expect(ids(eligibleAccounts(rule, list))).toEqual(["e", "x"]);
  });
  test("excludes balances outside the range, bounds inclusive", () => {
    const list = [acc("lo", { balance: 49.99 }), acc("min", { balance: 50 }), acc("max", { balance: 500 }), acc("hi", { balance: 500.01 })];
    expect(ids(eligibleAccounts({ ...rule, balanceMin: 50 }, list))).toEqual(["min", "max"]);
  });
  test("returns [] when nothing matches, and for empty input", () => {
    expect(eligibleAccounts({ ...rule, ageMin: 40, ageMax: 50 }, [acc("a")])).toEqual([]);
    expect(eligibleAccounts(rule, [])).toEqual([]);
  });
  test("inverted ranges match nothing", () => {
    expect(eligibleAccounts({ ...rule, ageMin: 12, ageMax: 7 }, [acc("a")])).toEqual([]);
  });
});
