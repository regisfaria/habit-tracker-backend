import { FastifyInstance } from "fastify";
import { z } from "zod";

import { getHabitSummary } from "../services/habit.service";

export async function summaryRoutes(app: FastifyInstance) {
  app.get("/summary", async (request) => {
    const summaryParams = z.object({
      userId: z.string(),
    });

    const { userId } = summaryParams.parse(request.query);

    return await getHabitSummary(userId);
  });
}
