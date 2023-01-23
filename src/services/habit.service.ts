import { Habit } from "@prisma/client";
import { getDay, getStartOfTodaysDate } from "../lib/date";
import {
  findPossibleHabits,
  findDay,
  newDay,
  newHabit,
  findDayHabit,
  deleteDayHabit,
  newDayHabit,
  DayWithHabits,
  findSummary,
} from "../lib/habit";

interface IResponse {
  possibleHabits: Habit[];
  completedHabits: string[];
}

export async function getDayHabitProgression(
  date: Date,
  userId: string
): Promise<IResponse> {
  const weekDay = getDay(date);

  const possibleHabits = await findPossibleHabits(date, weekDay, userId);

  const day = (await findDay(date, userId, true)) as DayWithHabits;

  const completedHabits = day?.dayHabits.map((habit) => habit.habit_id) ?? [];

  return {
    possibleHabits,
    completedHabits,
  };
}

export async function getHabitSummary(userId: string) {
  try {
    return await findSummary(userId);
  } catch (error) {
    console.log(error);
  }
}

export async function createNewHabit(
  title: string,
  weekDays: number[],
  userId: string
): Promise<boolean> {
  const habit = await newHabit(userId, title, weekDays);

  return !!habit;
}

export async function toggleDayHabit(habitId: string, userId: string) {
  try {
    const today = getStartOfTodaysDate();

    let day = await findDay(today, userId);

    if (!day) {
      day = await newDay(today, userId);
    }

    const dayHabit = await findDayHabit(day.id, habitId);

    if (dayHabit) {
      await deleteDayHabit(dayHabit.id);
    } else {
      await newDayHabit(day.id, habitId);
    }
  } catch (error) {
    console.log(error);
  }
}
