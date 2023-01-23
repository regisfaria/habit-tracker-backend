import { FastifyInstance } from "fastify";
import { z } from "zod";

import { getDayHabitProgression } from "../services/habit.service";

export async function dayRoutes(app: FastifyInstance) {
  app.get("/day", async (request) => {
    const getDayParams = z.object({
      date: z.coerce.date(),
      userId: z.string(),
    });

    const { date, userId } = getDayParams.parse(request.query);

    return getDayHabitProgression(date, userId);
  });
}
