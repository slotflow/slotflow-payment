import { log } from "../../shared/logger/logger";
import { Role } from "../../domain/enums/common.enum";
import { ERROR_CODES } from "../../shared/utils/types";
import { NextFunction, Request, Response } from "express";
import { UnauthorizedError } from "../../shared/error/appError";
import { AuthUser } from "../../application/dtos/common.dtos";

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.headers["x-user-id"];
    const role = req.headers["x-user-role"];
    const name = req.headers["x-user-name"];
    const email = req.headers["x-user-email"];

    const normalizedUserId = Array.isArray(userId) ? userId[0] : userId;
    const normalizedRole = Array.isArray(role) ? (role[0] as Role) : (role as Role);
    const normalizedName = Array.isArray(name) ? name[0] : name;
    const normalizedEmail = Array.isArray(email) ? email[0] : email;

    const cleanEmail = normalizedEmail ? decodeURIComponent(normalizedEmail).trim() : undefined;
    const cleanName = normalizedName ? decodeURIComponent(normalizedName).trim() : undefined;

    if (normalizedRole !== Role.ADMIN && !userId) {
      console.log("Unauthenticated request");
      res.status(401).json({ success: false, message: "Unauthenticated request" });
      return;
    };

    if (!normalizedUserId || !normalizedRole || !cleanName || !cleanEmail) {
      return next(
        new UnauthorizedError(
          "Invalid user identity headers",
          ERROR_CODES.USER_NOT_FOUND
        )
      );
    }

    const decodedUser: AuthUser = {
      id: normalizedUserId,
      role: normalizedRole,
      name: cleanName,
      email: cleanEmail,
    };

    req.user = decodedUser;

    next();
  } catch (error) {
    log.error("error", error as Error);
    res.status(401).json({ success: false, message: "Unauthorized: Invalid token." });
    return;
  };
};