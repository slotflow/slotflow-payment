import dayjs from "../config/dayjs";
import { FormattedDateTime } from "./types";

export const formatUtcDateTime = (input: string | number | Date): FormattedDateTime => {
  const utc = dayjs.utc(input);

  return {
    date: utc.format("YYYY-MM-DD"),
    time: utc.format("HH:mm A"),
  };
};

export const startOfDay = (date?: Date | string): Date => {
  return dayjs.utc(date).startOf("day").toDate();
};

export const endOfDay = (date?: Date | string): Date => {
  return dayjs.utc(date).endOf("day").toDate();
}

export const startOfMonth = (date?: Date | string): Date => {
  return dayjs.utc(date).startOf("month").toDate();
}

export const startOfToday = (): Date => {
  return dayjs.utc().startOf("day").toDate();
}

export const startOfTomorrow = (): Date => {
  return dayjs.utc().add(1, "day").startOf("day").toDate();
}

export const getUtcDateRange = (startDate: string | number | Date, endDate: string | number | Date): { startDate: string; endDate: string } => {
  const start = dayjs.utc(startDate);
  const end = dayjs.utc(endDate);

  return {
    startDate: start.format("YYYY-MM-DD"),
    endDate: end.format("YYYY-MM-DD"),
  };
};

export const isSubscriptionExpired = (endDate: string | Date): boolean => {
  return dayjs().isAfter(dayjs(endDate), "day");
};

export const getDateAfterDays = (days: number): Date => {
  return dayjs().add(days, "day").toDate();
};

export const getNumberOfMonths = (days: number): number => {
  return days / 30;
};

export const getNumberOfTotalDays = (numberOfMonths: number): number => {
  return numberOfMonths * 30
}

export const getStartAndEndDate = (startDate: Date, endDate: Date): { startDate: Date; endDate: Date } => {
  const start = new Date(startDate);
  const end = new Date(endDate);

  start.setHours(0, 0, 0, 0);
  end.setHours(23, 59, 59, 999);
  return { startDate: start, endDate: end };
}