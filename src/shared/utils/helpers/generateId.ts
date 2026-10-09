import { nanoid } from "nanoid";
import { v4 as uuidv4 } from "uuid";
import { AppError } from "../../error/appError";
import { PREFIX_MAP } from "../constants/constants";
import { ERROR_CODES, IdType } from "../types/enums";

export const generateId = (type: IdType, id?: string): string => {
  const prefix = PREFIX_MAP[type];

  if (!prefix) {
    throw new AppError(`Invalid IdType: ${type}`, 500, false, ERROR_CODES.INTERNAL_ERROR);
  }

  if (type === IdType.PAYMENT_INTENT && id) {
    return `${prefix}${id}`;
  }

  if (type === IdType.PAYMENT_CHARGEID && id) {
    return `${prefix}${id}`;
  }

  if (type === IdType.PAYMENT_INTENT || type === IdType.PAYMENT_CHARGEID) {
    return `${prefix}${nanoid(16)}`;
  }

  if (type === IdType.TRANSACTION) {
    return nanoid(16);
  }

  return `${prefix}${uuidv4()}`;
};
