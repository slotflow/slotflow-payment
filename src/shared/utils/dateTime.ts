import dayjs from "../config/dayjs";
import { FormattedDateTime } from "./type";

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