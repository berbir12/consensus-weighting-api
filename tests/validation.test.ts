import { describe, expect, it } from "vitest";

import { validateAllocations } from "../src/validation/allocations.js";

describe("validateAllocations", () => {
  it("accepts an array of valid allocations", () => {
    const allocations = [
      { userId: "user_1", targetId: "Target A", amount: 100 },
      { userId: "user_2", targetId: "Target B", amount: 0 },
    ];

    expect(validateAllocations(allocations)).toEqual({
      valid: true,
      allocations,
    });
  });

  it("rejects non-array input", () => {
    expect(validateAllocations({})).toEqual({
      valid: false,
      error: "Input must be an array of allocations.",
    });
  });

  it.each([
    ["missing", { targetId: "Target A", amount: 10 }, "userId is required"],
    ["empty", { userId: "", targetId: "Target A", amount: 10 }, "userId must be a non-empty string"],
    ["whitespace-only", { userId: "   ", targetId: "Target A", amount: 10 }, "userId must be a non-empty string"],
    ["non-string", { userId: 1, targetId: "Target A", amount: 10 }, "userId must be a string"],
  ])("rejects a %s userId", (_case, allocation, expectedError) => {
    const result = validateAllocations([allocation]);

    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.error).toContain(expectedError);
    }
  });

  it.each([
    ["missing", { userId: "user_1", amount: 10 }, "targetId is required"],
    ["empty", { userId: "user_1", targetId: "", amount: 10 }, "targetId must be a non-empty string"],
    ["whitespace-only", { userId: "user_1", targetId: "   ", amount: 10 }, "targetId must be a non-empty string"],
    ["non-string", { userId: "user_1", targetId: 1, amount: 10 }, "targetId must be a string"],
  ])("rejects a %s targetId", (_case, allocation, expectedError) => {
    const result = validateAllocations([allocation]);

    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.error).toContain(expectedError);
    }
  });

  it.each([
    ["missing", { userId: "user_1", targetId: "Target A" }, "amount is required"],
    ["non-number", { userId: "user_1", targetId: "Target A", amount: "10" }, "amount must be a number"],
    ["NaN", { userId: "user_1", targetId: "Target A", amount: Number.NaN }, "amount must be finite"],
    ["Infinity", { userId: "user_1", targetId: "Target A", amount: Number.POSITIVE_INFINITY }, "amount must be finite"],
    ["negative", { userId: "user_1", targetId: "Target A", amount: -1 }, "amount must be greater than or equal to zero"],
  ])("rejects a %s amount", (_case, allocation, expectedError) => {
    const result = validateAllocations([allocation]);

    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.error).toContain(expectedError);
    }
  });

  it("identifies the index of an invalid allocation", () => {
    const result = validateAllocations([
      { userId: "user_1", targetId: "Target A", amount: 10 },
      null,
    ]);

    expect(result).toEqual({
      valid: false,
      error: "allocations[1] must be an object.",
    });
  });
});
