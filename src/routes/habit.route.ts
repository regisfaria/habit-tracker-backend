import { FastifyInstance } from "fastify";
import { z } from "zod";

import { createNewHabit, toggleDayHabit } from "../services/habit.service";

export async function habitRoutes(app: FastifyInstance) {
  app.post("/habits", async (request, response) => {
    const createHabitBody = z.object({
      title: z.string(),
      weekDays: z.array(z.number().min(0).max(6)),
      userId: z.string(),
    });

    const { title, weekDays, userId } = createHabitBody.parse(request.body);

    const habitWasCreated = createNewHabit(title, weekDays, userId);

    if (!habitWasCreated) {
      return response.code(400);
    }

    return response.code(201);
  });

  app.patch("/habits/toggle/:id/:userId", async (request, response) => {
    const toggleHabitParams = z.object({
      id: z.string().uuid(),
      userId: z.string(),
    });

    const { id, userId } = toggleHabitParams.parse(request.params);

    await toggleDayHabit(id, userId);
  });
}
