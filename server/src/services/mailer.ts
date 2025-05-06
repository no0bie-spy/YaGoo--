import nodemailer from "nodemailer";
import env from "../Ienv"; // Ensure this path is correct

// Create nodemailer transport
const transporter = nodemailer.createTransport({
  host: (env as any).SMTP_HOST,
  port: (env as any).SMTP_PORT,
  auth: {
    user: env.SMTP_USERNAME,
    pass: env.SMTP_PASSWORD,
  },
});

// Helper to generate a 6-digit token
function generateToken(): string {
  return (100000 + Math.floor(Math.random() * 900000)).toString();
}

// Generic function to send emails
async function sendEmail(to: string, subject: string, html: string, text: string): Promise<{ token: string; info: any }> {
  const token = generateToken();

  const info = await transporter.sendMail({
    from: `"YaGOo" `,
    to,
    subject,
    text,
    html,
  });

  console.log("Message sent: %s", info.messageId);
  return { token, info };
}

// 📩 Specific email sending functions

export const sendRecoveryEmail = (userEmail: string) => {
  const subject = "Password Recovery - Verify Your Email";
  const token = generateToken();
  const text = `Hello, use the token to verify your email: ${token}`;
  const html = `<p>Dear User,</p>
    <p>Please use the following token to verify your email address:</p>
    <p><b style="font-size: 20px;">${token}</b></p>
    <p>Do not share this token with anyone.</p>
    <p>Thank you,<br />The YaGOo Team</p>`;
  return sendEmail(userEmail, subject, html, text);
};

export const sendRiderRegistrationEmail = (userEmail: string) => {
  const subject = "Rider Registration - Verify Your Email";
  const token = generateToken();
  const text = `Hello, use the following token to verify your email: ${token}`;
  const html = `<p>Dear Rider,</p>
    <p>Thank you for registering with YaGOo.</p>
    <p>Your verification token:</p>
    <p><b style="font-size: 20px;">${token}</b></p>
    <p>Do not share this token with anyone.</p>
    <p>Welcome aboard!<br />The YaGOo Team</p>`;
  return sendEmail(userEmail, subject, html, text);
};

export const sendNormalRegistrationEmail = (userEmail: string) => {
  const subject = "Normal Registration - Verify Your Email";
  const token = generateToken();
  const text = `Hello, use the following token to verify your email: ${token}`;
  const html = `<p>Dear User,</p>
    <p>Thank you for registering with YaGOo.</p>
    <p>Your verification token:</p>
    <p><b style="font-size: 20px;">${token}</b></p>
    <p>Do not share this token with anyone.</p>
    <p>Welcome aboard!<br />The YaGOo Team</p>`;
  return sendEmail(userEmail, subject, html, text);
};

export const sendRideOtp = (userEmail: string) => {
  const subject = "Ride OTP - Verify Your Ride";
  const token = generateToken();
  const text = `Hello, use the following OTP to verify your ride: ${token}`;
  const html = `<p>Dear Rider,</p>
    <p>You are about to embark on your ride. Please use the OTP below to confirm your ride:</p>
    <p><b style="font-size: 20px;">${token}</b></p>
    <p>Do not share this OTP with anyone.</p>
    <p>Thank you for choosing YaGOo!<br />The YaGOo Team</p>`;
  return sendEmail(userEmail, subject, html, text);
};
