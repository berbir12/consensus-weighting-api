import Fastify from "fastify";

import { weightsRoutes } from "./routes/weights.js";

export function buildApp() {
  const app = Fastify({ logger: true });

  app.register(weightsRoutes);

  return app;
}
