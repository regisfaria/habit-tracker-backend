import { FastifyInstance } from "fastify";
import { date, z } from "zod";
import { getDay, getStartOfTodaysDate } from "./lib/date";

import { prisma } from "./lib/prisma";

export async function appRoutes(app: FastifyInstance) {
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

  app.get("/summary", async (request) => {
    const summaryParams = z.object({
      userId: z.string(),
    });

    const { userId } = summaryParams.parse(request.query);

    // FYI: I'll use a SQL Raw query in order to achieve this summary
    // meaning that the Prisma BD compatibility maybe won't work for this endpoint
    // in case we use something different than SQLite
    const summary = await prisma.$queryRaw`
      SELECT
        D.id,
        D.date,
        (
          SELECT
            cast(count(*) AS FLOAT)
          FROM day_habits DH
          WHERE DH.day_id = D.id
        ) AS completed,
        (
          SELECT
            cast(count(*) AS FLOAT)
          FROM habit_week_days HWD
          JOIN habits H
            ON H.id = HWD.habit_id
          WHERE
            HWD.week_day = cast(strftime('%w', D.date/1000.0, 'unixepoch') AS INT)
            AND H.created_at <= D.date
        ) AS amount
      FROM days D
      WHERE D.user_id = ${userId}
    `;

    return summary;
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
