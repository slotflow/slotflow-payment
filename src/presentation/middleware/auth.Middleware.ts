import { log } from "../../shared/logger/logger";
import { Role } from "../../domain/enums/common.enum";
import { NextFunction, Request, Response } from "express";
import { ERROR_CODES } from "../../shared/utils/types/enums";
import { UnauthorizedError } from "../../shared/error/appError";
import { safeDecode } from "../../shared/utils/helpers/safeDecode";
import { AuthUser, TimeZone } from "../../application/dtos/common.dtos";

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.headers["x-user-id"];
    const role = req.headers["x-user-role"];
    const name = req.headers["x-user-name"];
    const email = req.headers["x-user-email"];
    const timeZone = req.headers["x-user-timezone"];

    const rawUserId = Array.isArray(userId) ? userId[0] : userId;
    const rawRole = Array.isArray(role) ? role[0] : role;
    const rawName = Array.isArray(name) ? name[0] : name;
    const rawEmail = Array.isArray(email) ? email[0] : email;
    const rawTimeZone = Array.isArray(timeZone) ? timeZone[0] : timeZone;

    const normalizedUserId = safeDecode(rawUserId);
    const normalizedRole = safeDecode(rawRole) as Role | undefined;
    const normalizedName = safeDecode(rawName);
    const normalizedEmail = safeDecode(rawEmail);

    let normalizedTimeZone: TimeZone | string | undefined;
    if (rawTimeZone) {
      const decodedTimeZoneStr = safeDecode(rawTimeZone);
      if (decodedTimeZoneStr) {
        try {
          normalizedTimeZone = JSON.parse(decodedTimeZoneStr) as TimeZone;
        } catch {
          normalizedTimeZone = decodedTimeZoneStr as unknown as TimeZone;
        }
      }
    }

    if (normalizedRole !== Role.ADMIN && !normalizedUserId) {
      res.status(401).json({ success: false, message: "Unauthenticated request" });
      return;
    }

    if (
      !normalizedUserId ||
      !normalizedRole ||
      !normalizedName ||
      !normalizedEmail ||
      !normalizedTimeZone
    ) {
      return next(
        new UnauthorizedError("Invalid user identity headers", ERROR_CODES.USER_NOT_FOUND),
      );
    }

    const decodedUser: AuthUser = {
      id: normalizedUserId,
      role: normalizedRole,
      name: normalizedName,
      email: normalizedEmail,
      timeZone: normalizedTimeZone as TimeZone,
    };

    req.user = decodedUser;

    next();
  } catch (error) {
    log.error("error", { error });
    res.status(401).json({ success: false, message: "Unauthorized: Invalid token." });
    return;
  }
};
