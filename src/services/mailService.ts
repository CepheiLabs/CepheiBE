import transport, { FROM_EMAIL } from "../config/mailConfig.js";
import { InternalServerError } from "../errors/index.js";
import logger from "../utils/logger.js";

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
 * @desc sends link to email
 */
