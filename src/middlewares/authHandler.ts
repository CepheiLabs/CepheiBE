import handleAsync from "express-async-handler";

import { UnauthorizedError } from "../errors";
import { verifyToken } from "../utils/jwt";

// 1. THE STRICT
export const protect = handleAsync(async (req, res, next) => {
  const token =
    req.cookies.accessToken || req.headers.authorization?.split(" ")[1];

  if (!token) {
    throw new UnauthorizedError("Please log in to access this resource");
  }

  const decoded = verifyToken(token);
  req.user = { id: decoded.id };
  next();
});

// 2. THE SOFT
export const identify = handleAsync(async (req, res, next) => {
  const token =
    req.cookies?.accessToken || req.headers.authorization?.split(" ")[1];

  if (token) {
    try {
      const decoded = verifyToken(token);
      req.user = { id: decoded.id };
    } catch (err) {
      //do nothing.............
    }
  }

  next();
});
