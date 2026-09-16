import { Role } from "./domain/enums/role.enum";
import { AuthUser } from "./application/dtos/common.dto";

// Extend the Request interface
declare global {
    namespace Express {
        interface User extends AuthUser { }
        interface Request {
            user: User;
        };
    };
};

