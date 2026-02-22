import nodemailer from "nodemailer";
import dotenv from "dotenv";
import { InternalServerError } from "../errors";

dotenv.config();

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const GOOGLE_CLIENT_REFRESH_TOKEN = process.env.GOOGLE_CLIENT_REFRESH_TOKEN;

// Ensuring it get's all required environment variables
if (
  !GOOGLE_CLIENT_ID ||
  !GOOGLE_CLIENT_SECRET ||
  !GOOGLE_CLIENT_REFRESH_TOKEN
) {
  throw new InternalServerError("Failed to load config");
}

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    type: "OAuth2",
    user: "emmanuelnosakhare052@gmail.com",
    clientId: GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    refreshToken: GOOGLE_CLIENT_REFRESH_TOKEN,
  },
});

export default transporter;
