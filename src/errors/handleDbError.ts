import { ConflictError, BadRequestError } from "../errors/index.js";

export const handleDbError = (err: any) => {
  // Extract the code from wherever Drizzle/Postgres hid it
  const code = err.code || err.cause?.code || err.detail?.code;
  const message = err.message || "";

  if (code === "23505" || message.includes("unique constraint")) {
    throw new ConflictError("This record already exists.");
  }

  if (code === "22P02") {
    throw new BadRequestError("Invalid data format.");
  }

  throw err;
};
