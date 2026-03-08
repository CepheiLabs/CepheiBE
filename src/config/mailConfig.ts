import nodemailer from "nodemailer";
import { InternalServerError } from "../errors/index.js";

const MAILTRAP_USERNAME = process.env.MAILTRAP_USER;
const MAILTRAP_PASSWORD = process.env.MAILTRAP_PASSWORD;

if (!MAILTRAP_USERNAME || !MAILTRAP_PASSWORD) {
  throw new InternalServerError(
    "Missing .env variables (MAILTRAP_USERNAME or MAILTRAP_PASSWORD)",
  );
}

var transport = nodemailer.createTransport({
  host: "sandbox.smtp.mailtrap.io",
  port: 2525,
  auth: {
    user: MAILTRAP_USERNAME,
    pass: MAILTRAP_PASSWORD,
  },
});

export const FROM_EMAIL = process.env.EMAIL_FROM || "gooner@cephi.com";
export default transport;
