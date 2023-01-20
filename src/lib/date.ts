import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);

export function getStartOfTodaysDate(): Date {
  return dayjs().utcOffset(0).startOf("day").toDate();
}

export function getDay(date: Date): number {
  return dayjs(date).get("day");
}
