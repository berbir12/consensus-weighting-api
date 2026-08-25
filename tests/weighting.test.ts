import { describe, expect, it } from "vitest";

import { calculateWeights } from "../src/services/weighting.js";
import type { Allocation } from "../src/types.js";

describe("calculateWeights", () => {
  it("calculates concentrated value from one contributor", () => {
    const allocations: Allocation[] = [
      { userId: "user_1", targetId: "Target A", amount: 10_000 },
    ];

    const [result] = calculateWeights(allocations);

    expect(result).toEqual({
      targetId: "Target A",
      rawTotal: 10_000,
      uniqueUserCount: 1,
      weight: 10_000,
    });
  });

  it("rewards value distributed across many unique contributors", () => {
    const concentratedAllocations: Allocation[] = [
      { userId: "user_1", targetId: "Target A", amount: 10_000 },
    ];
    const distributedAllocations: Allocation[] = Array.from(
      { length: 100 },
      (_, index) => ({
        userId: `user_${index + 1}`,
        targetId: "Target B",
        amount: 100,
      }),
    );

    const [targetA] = calculateWeights(concentratedAllocations);
    const [targetB] = calculateWeights(distributedAllocations);

    expect(targetB).toEqual({
      targetId: "Target B",
      rawTotal: 10_000,
      uniqueUserCount: 100,
      weight: 1_000_000,
    });
    expect(targetB.weight).toBeGreaterThanOrEqual(targetA.weight * 2);
  });

  it("combines duplicate allocations before applying the square root", () => {
    const allocations: Allocation[] = [
      { userId: "user_1", targetId: "Target C", amount: 50 },
      { userId: "user_1", targetId: "Target C", amount: 50 },
      { userId: "user_2", targetId: "Target C", amount: 100 },
    ];

    const [result] = calculateWeights(allocations);

    expect(result).toEqual({
      targetId: "Target C",
      rawTotal: 200,
      uniqueUserCount: 2,
      weight: 400,
    });
  });
});
