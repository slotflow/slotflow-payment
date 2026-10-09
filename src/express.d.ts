import { AuthUser } from "./application/dtos/common.dto";

// Extend the Request interface
declare global {
  namespace Express {
    interface Request {
      user: AuthUser;
    }
  }
}
