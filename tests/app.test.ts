import { afterEach, describe, expect, it } from "vitest";

import { buildApp } from "../src/app.js";

const apps: ReturnType<typeof buildApp>[] = [];

afterEach(async () => {
  await Promise.all(apps.splice(0).map((app) => app.close()));
});

describe("buildApp", () => {
  it("creates a Fastify application", () => {
    const app = buildApp();
    apps.push(app);

    expect(app).toBeDefined();
  });
});
