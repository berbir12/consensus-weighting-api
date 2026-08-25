import type { FastifyPluginAsync } from "fastify";

import { calculateWeights } from "../services/weighting.js";
import { validateAllocations } from "../validation/allocations.js";

export const weightsRoutes: FastifyPluginAsync = async (app) => {
  app.post("/api/weights", async (request, reply) => {
    const validation = validateAllocations(request.body);

    if (!validation.valid) {
      return reply.code(400).send({ error: validation.error });
    }

    return calculateWeights(validation.allocations);
  });
};
