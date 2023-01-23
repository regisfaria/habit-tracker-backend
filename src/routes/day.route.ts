import { FastifyInstance } from "fastify";
import { z } from "zod";
import { getDay } from "../lib/date";

import { prisma } from "../lib/prisma";

export async function dayRoutes(app: FastifyInstance) {
  app.get("/day", async (request) => {
    const getDayParams = z.object({
      date: z.coerce.date(),
      userId: z.string(),
    });

    const { date, userId } = getDayParams.parse(request.query);

    const weekDay = getDay(date);

    const possibleHabits = await prisma.habit.findMany({
      where: {
        created_at: {
          lte: date,
        },
        user_id: userId,
        weekDays: {
          some: {
            week_day: weekDay,
          },
        },
      },
    });

    const day = await prisma.day.findUnique({
      where: {
        date_user_id: {
          date: date,
          user_id: userId,
        },
      },
      include: {
        dayHabits: true,
      },
    });

    const completedHabits = day?.dayHabits.map((habit) => habit.habit_id) ?? [];

    return {
      possibleHabits,
      completedHabits,
    };
  });
}
