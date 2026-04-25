import { log } from "../../shared/logger/logger";
import { Role } from "../../domain/enums/common.enum";
import { NextFunction, Request, Response } from "express";
import { DecodedUser } from "../../application/dtos/common.dtos";

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {

  try {
    const userId = req.headers["x-user-id"];
    const role = req.headers["x-user-role"];
    
    if (role !== Role.ADMIN && !userId) {
      console.log("Unauthenticated request");
      res.status(401).json({ success: false, message: "Unauthenticated request" });
      return;
    };

    const normalizedUserId = Array.isArray(userId) ? userId[0] : userId;
    const normalizedRole = Array.isArray(role)
      ? (role[0] as Role)
      : (role as Role);

    req.user = {
      id: normalizedUserId,
      role: normalizedRole,
    } as DecodedUser;

    next();
  } catch (error) {
    log.error("error", error as Error);
    res.status(401).json({ success: false, message: "Unauthorized: Invalid token." });
    return;
  };
};