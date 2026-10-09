import { dateFormats } from "../constants/constants";

//
export interface FormattedDateTime {
  date: string;
  time: string;
}

//
export type DateInput = Date | string | number | null | undefined;
export type DateFormatPattern = (typeof dateFormats)[keyof typeof dateFormats] | (string & {});

//
export interface DateRangeResult {
  start: Date;
  end: Date;
  days: number;
  duration: number;
  prevStart: Date;
  prevEnd: Date;
}

//
export interface DateRangeProps {
  startDate: Date | string;
  endDate: Date | string;
  timeZone?: string;
}
