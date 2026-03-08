import nodemailer from "nodemailer";
import { InternalServerError } from "../errors/index.js";

const EMAIL_USERNAME = process.env.EMAIL_USER;
const EMAIL_PASSWORD = process.env.EMAIL_PASSWORD;

if (!EMAIL_USERNAME || !EMAIL_PASSWORD) {
  throw new InternalServerError(
    "Missing .env variables (EMAIL_USERNAME or EMAIL_PASSWORD)",
  );
}

var transport = nodemailer.createTransport({
  host: "sandbox.smtp.mailtrap.io",
  port: 2525,
  auth: {
    user: EMAIL_USERNAME,
    pass: EMAIL_PASSWORD,
  },
});

export const FROM_EMAIL = process.env.EMAIL_FROM || "gooner@cephi.com";
export default transport;
