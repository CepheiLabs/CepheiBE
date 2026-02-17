import { playersTable } from "../../db/schema";

declare global {
  namespace Express {
    interface Request {
      user?: {
        id?: string;
        email?: string;
        username?: string;
      };
    }
  }
}
