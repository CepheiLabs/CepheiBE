import transport, { FROM_EMAIL } from "../config/mailConfig";
import { InternalServerError } from "../errors";
import logger from "../utils/logger";

/**
 * Service to verify that the Mailtrap SMTP connection is working
 * @desc Sends test mail to a recipient
 * @param recipient - The email address to send the test to
 */
export const sendTestMail = async (
  recipient: string = "imafidonemmanuel004@gmail.com",
) => {
  const mailOptions = {
    from: `"Cephi Admin" <${FROM_EMAIL}>`,
    to: recipient,
    subject: "Cephi Mailtrap Test 🚀",
    text: "Omo, if you see this, the SMTP bridge is active!",
    html: `
      <div style="font-family: sans-serif; border: 2px solid #522cad; padding: 20px; border-radius: 10px;">
        <h2 style="color: #522cad;">Cephi Backend Live</h2>
        <p>Testing <strong>Nodemailer + Mailtrap</strong> integration.</p>
        <p>Current Server Time: <b>${new Date().toLocaleTimeString()}</b></p>
        <hr style="border: 0; border-top: 1px solid #eee;" />
        <small>This is a development test email.</small>
      </div>
    `,
  };

  try {
    await transport.sendMail(mailOptions);
    logger.info(`Test mail sent successfully to email: ${mailOptions.to}`);
  } catch (err: any) {
    logger.error("SMTP Error:", err.message);
    throw new InternalServerError("Failed to send test email through SMTP");
  }
};

/**
 * @desc Service to send Password Reset Email using the Cephi branded template
 * @param to recepient email
 * @param player player name
 * @param token the token
 */
export const sendPasswordResetEmail = async (
  to: string,
  player: string,
  token: string,
) => {
  // Use your env for the frontend URL
  const resetUrl = `${process.env.FRONTEND_URL}/api/v1/auth/reset-password?token=${token}`;

  const mailOptions = {
    from: `"Cephi Admin" <${FROM_EMAIL}>`,
    to: to,
    subject: "Reset your Cephi Password 🔐",
    text: `Hello ${player}, use this link to reset your password: ${resetUrl}. It expires in 15 minutes.`,
    html: `
  <div style="font-family: sans-serif; border: 2px solid #522cad; padding: 20px; border-radius: 10px; max-width: 500px;">
    <h2 style="color: #522cad;">Password Reset Request</h2>
    <p>Hello <b>${player}</b>,</p>
    <p>We received a request to reset your password for your Cephi account.</p>
    
    <div style="margin: 30px 0; text-align: center;">
      <a href="${resetUrl}" 
         style="background-color: #522cad; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
         Reset My Password
      </a>
    </div>

    <p style="font-size: 0.9em; color: #333;">
      If the button above doesn't work, copy and paste the link below into your browser:
    </p>
    
    <div style="background-color: #f4f4f4; padding: 10px; border-radius: 5px; word-break: break-all; font-family: monospace; font-size: 0.85em; border: 1px solid #eee; color: #522cad;">
      ${resetUrl}
    </div>

    <p style="font-size: 0.8em; color: #666; margin-top: 20px;">
      This link will expire in <b>15 minutes</b>. If you didn't request this, you can safely ignore this email.
    </p>
    
    <hr style="border: 0; border-top: 1px solid #eee;" />
    <small style="color: #999;">Cephi Staking App - Secure your assets.</small>
  </div>
`,
  };

  try {
    await transport.sendMail(mailOptions);
    logger.info(`Password reset email sent successfully to: ${to}`);
  } catch (err: any) {
    logger.error("SMTP Reset Email Error:", err.message);
    throw new InternalServerError("Failed to send password reset email");
  }
};

/**
 * @desc Service to send Email Verification link using Cephi branding
 * @param to recipient email
 * @param player player name
 * @param token the verification token
 */
export const sendEmailVerificationEmail = async (
  to: string,
  player: string,
  token: string,
) => {
  // 1. Point this to your verification endpoint [cite: 2026-02-22]
  const verificationUrl = `${process.env.FRONTEND_URL}/api/v1/auth/verify-email?token=${token}`;

  const mailOptions = {
    from: `"Cephi Admin" <${FROM_EMAIL}>`,
    to: to,
    subject: "Verify your Cephi Account 🛡️",
    text: `Hello ${player}, welcome to Cephi! Verify your email using this link: ${verificationUrl}. This link expires in 24 hours.`,
    html: `
  <div style="font-family: sans-serif; border: 2px solid #522cad; padding: 20px; border-radius: 10px; max-width: 500px;">
    <h2 style="color: #522cad;">Welcome to Cephi!</h2>
    <p>Hello <b>${player}</b>,</p>
    <p>We're excited to have you join the Cephi staking community. Please verify your email address to secure your account and start staking.</p>
    
    <div style="margin: 30px 0; text-align: center;">
      <a href="${verificationUrl}" 
         style="background-color: #522cad; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
          Verify My Email
      </a>
    </div>

    <p style="font-size: 0.9em; color: #333;">
      If the button above doesn't work, copy and paste the link below into your browser:
    </p>
    
    <div style="background-color: #f4f4f4; padding: 10px; border-radius: 5px; word-break: break-all; font-family: monospace; font-size: 0.85em; border: 1px solid #eee; color: #522cad;">
      ${verificationUrl}
    </div>

    <p style="font-size: 0.8em; color: #666; margin-top: 20px;">
      This link will expire in <b>24 hours</b>. If you didn't sign up for Cephi, you can safely ignore this email.
    </p>
    
    <hr style="border: 0; border-top: 1px solid #eee;" />
    <small style="color: #999;">Cephi Staking App - Secure your assets.</small>
  </div>
`,
  };

  try {
    await transport.sendMail(mailOptions);
    logger.info(`Verification email sent successfully to: ${to}`);
  } catch (err: any) {
    logger.error("SMTP Verification Email Error:", err.message);
    throw new InternalServerError("Failed to send verification email");
  }
};
