import { OAuth2Client } from "google-auth-library";

const GOOGLE_AUTH_CLIENT = process.env.GOOGLE_CLIENT_ID as string;

const googleAuthClient = new OAuth2Client(GOOGLE_AUTH_CLIENT);

export default googleAuthClient;
