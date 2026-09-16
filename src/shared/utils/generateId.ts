import { v4 as uuidv4 } from "uuid";
import { PREFIX_MAP } from "./constants";
import { AppError } from "../error/appError";
import { ERROR_CODES, IdType } from "./types";

export const generateId = (type: IdType, id?: string): string => {
    const prefix = PREFIX_MAP[type];

    if (!prefix) {
        throw new AppError(
            `Invalid IdType: ${type}`,
            500,
            false,
            ERROR_CODES.INTERNAL_ERROR
        );
    }

    if (type === IdType.PAYMENT_INTENT && id) {
        return `${prefix}${id}`;
    }

    if (type === IdType.PAYMENT_CHARGEID && id) {
        return `${prefix}${id}`;
    }

    return `${prefix}${uuidv4()}`;
};