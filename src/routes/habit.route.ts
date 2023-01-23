import { FastifyInstance } from "fastify";
import { z } from "zod";
import { getStartOfTodaysDate } from "../lib/date";

import { prisma } from "../lib/prisma";

export async function habitRoutes(app: FastifyInstance) {
  app.post("/habits", async (request) => {
    const createHabitBody = z.object({
      title: z.string(),
      weekDays: z.array(z.number().min(0).max(6)),
      userId: z.string(),
    });

    const { title, weekDays, userId } = createHabitBody.parse(request.body);

    const today = getStartOfTodaysDate();

    await prisma.habit.create({
      data: {
        title,
        user_id: userId,
        created_at: today,
        weekDays: {
          create: weekDays.map((weekDay) => {
            return {
              week_day: weekDay,
            };
          }),
        },
      },
    });
  });

  app.patch("/habits/toggle/:id/:userId", async (request) => {
    const toggleHabitParams = z.object({
      id: z.string().uuid(),
      userId: z.string(),
    });

    const { id, userId } = toggleHabitParams.parse(request.params);

    const today = getStartOfTodaysDate();

    let day = await prisma.day.findUnique({
      where: {
        date_user_id: {
          date: today,
          user_id: userId,
        },
      },
    });

    if (!day) {
      day = await prisma.day.create({
        data: {
          date: today,
          user_id: userId,
        },
      });
    }

    const dayHabit = await prisma.dayHabit.findUnique({
      where: {
        day_id_habit_id: {
          day_id: day.id,
          habit_id: id,
        },
      },
    });

    if (dayHabit) {
      await prisma.dayHabit.delete({
        where: {
          id: dayHabit.id,
        },
      });
    } else {
      await prisma.dayHabit.create({
        data: {
          day_id: day.id,
          habit_id: id,
        },
      });
    }
  });
}
