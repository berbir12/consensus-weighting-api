import { afterEach, describe, expect, it } from "vitest";

import { buildApp } from "../src/app.js";

const apps: ReturnType<typeof buildApp>[] = [];

afterEach(async () => {
  await Promise.all(apps.splice(0).map((app) => app.close()));
});

function createApp() {
  const app = buildApp();
  apps.push(app);
  return app;
}

describe("POST /api/weights", () => {
  it("returns the calculated weights for a valid request", async () => {
    const app = createApp();

    const response = await app.inject({
      method: "POST",
      url: "/api/weights",
      payload: [
        { userId: "user_1", targetId: "Target C", amount: 50 },
        { userId: "user_1", targetId: "Target C", amount: 50 },
        { userId: "user_2", targetId: "Target C", amount: 100 },
      ],
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual([
      {
        targetId: "Target C",
        rawTotal: 200,
        uniqueUserCount: 2,
        weight: 400,
      },
    ]);
  });

  it("rewards distributed value over concentrated value through HTTP", async () => {
    const app = createApp();
    const distributedAllocations = Array.from(
      { length: 100 },
      (_, index) => ({
        userId: `distributed_user_${index + 1}`,
        targetId: "Target B",
        amount: 100,
      }),
    );

    const response = await app.inject({
      method: "POST",
      url: "/api/weights",
      payload: [
        { userId: "concentrated_user", targetId: "Target A", amount: 10_000 },
        ...distributedAllocations,
      ],
    });

    expect(response.statusCode).toBe(200);

    const [targetA, targetB] = response.json();
    expect(targetA).toEqual({
      targetId: "Target A",
      rawTotal: 10_000,
      uniqueUserCount: 1,
      weight: 10_000,
    });
    expect(targetB).toEqual({
      targetId: "Target B",
      rawTotal: 10_000,
      uniqueUserCount: 100,
      weight: 1_000_000,
    });
    expect(targetB.weight).toBeGreaterThanOrEqual(targetA.weight * 2);
  });

  it("returns 400 for invalid input", async () => {
    const app = createApp();

    const response = await app.inject({
      method: "POST",
      url: "/api/weights",
      payload: { userId: "user_1", targetId: "Target A", amount: 100 },
    });

    expect(response.statusCode).toBe(400);
    expect(response.json()).toEqual({
      error: "Input must be an array of allocations.",
    });
  });

  it("returns an empty result for an empty allocation array", async () => {
    const app = createApp();

    const response = await app.inject({
      method: "POST",
      url: "/api/weights",
      payload: [],
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual([]);
  });
});
