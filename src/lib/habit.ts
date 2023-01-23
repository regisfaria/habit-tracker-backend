import { prisma } from "./prisma";
import { getStartOfTodaysDate } from "./date";
import { Day, DayHabit, Habit } from "@prisma/client";

export type DayWithHabits = Day & {
  dayHabits: DayHabit[];
};

//////////////
// RAW SQL  //
//////////////
export async function findSummary(userId: string) {
  // FYI: I'll use a SQL Raw query in order to achieve this summary
  // meaning that the Prisma BD compatibility maybe won't work for this endpoint
  // in case we use something different than SQLite
  return prisma.$queryRaw`
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
}

//////////////
// Find     //
//////////////
export async function findPossibleHabits(
  date: Date,
  weekDay: number,
  userId: string
): Promise<Habit[]> {
  return prisma.habit.findMany({
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
}

export async function findDay(
  date: Date,
  userId: string,
  includeHabits: boolean = false
): Promise<DayWithHabits | Day | null> {
  return prisma.day.findUnique({
    where: {
      date_user_id: {
        date: date,
        user_id: userId,
      },
    },
    include: {
      dayHabits: includeHabits,
    },
  });
}

export async function findDayHabit(
  dayId: string,
  habitId: string
): Promise<DayHabit | null> {
  return prisma.dayHabit.findUnique({
    where: {
      day_id_habit_id: {
        day_id: dayId,
        habit_id: habitId,
      },
    },
  });
}

//////////////
// Create   //
//////////////
export async function newHabit(
  userId: string,
  title: string,
  weekDays: number[]
): Promise<Habit> {
  return await prisma.habit.create({
    data: {
      title,
      user_id: userId,
      created_at: getStartOfTodaysDate(),
      weekDays: {
        create: weekDays.map((weekDay) => {
          return {
            week_day: weekDay,
          };
        }),
      },
    },
  });
}

export async function newDay(date: Date, userId: string): Promise<Day> {
  return prisma.day.create({
    data: {
      date: date,
      user_id: userId,
    },
  });
}

export async function newDayHabit(
  dayId: string,
  habitId: string
): Promise<DayHabit> {
  return prisma.dayHabit.create({
    data: {
      day_id: dayId,
      habit_id: habitId,
    },
  });
}

//////////////
// Delete   //
//////////////
export async function deleteDayHabit(id: string): Promise<void> {
  await prisma.dayHabit.delete({
    where: {
      id,
    },
  });
}
