import { expect, test } from "vitest";
import { splitSettlement } from "./settlement";

test("splitSettlement", () => {
  expect(splitSettlement(100, 40)).toEqual({ fromAccount: 40, fromGateway: 60 });
  expect(splitSettlement(100, 0)).toEqual({ fromAccount: 0, fromGateway: 100 });
  expect(splitSettlement(100, 250)).toEqual({ fromAccount: 100, fromGateway: 0 });
  expect(splitSettlement(0, 50)).toEqual({ fromAccount: 0, fromGateway: 0 });
  expect(splitSettlement(100, -5)).toEqual({ fromAccount: 0, fromGateway: 100 });
});
