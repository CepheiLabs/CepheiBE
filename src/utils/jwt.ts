import jwt from "jsonwebtoken";
import { BadRequestError } from "../errors";

const JWT_SECRET = process.env.JWT_SECRET as string;

export const signToken = (id: string): string => {
  return jwt.sign({ id }, JWT_SECRET, {
    expiresIn: "1d",
  });
};

export const verifyToken = (token: string) => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string };
    return decoded;
  } catch (err) {
    throw new BadRequestError("Invalid or expired token");
  }
};
