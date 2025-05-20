import nodemailer from 'nodemailer';
import env from '../Ienv'; // Ensure this path is correct

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
async function sendEmail(
  to: string,
  subject: string,
  html: string,
  text: string
) {
  const info = await transporter.sendMail({
    from: `"YaGOo" `,
    to,
    subject,
    text,
    html,
  });

  console.log('Message sent: %s', info.messageId);
}

// 📩 Specific email sending functions

export const sendRecoveryEmail = async (userEmail: string): Promise<string> => {
  const subject = 'Password Recovery - Verify Your Email';
  const token = generateToken();
  console.log('Generated OTP:', token);
  const text = `Hello, use the token to verify your email: ${token}`;
  const html = `<p>Dear User,</p>
    <p>Please use the following token to verify your email address:</p>
    <p><b style="font-size: 20px;">${token}</b></p>
    <p>Do not share this token with anyone.</p>
    <p>Thank you,<br />The YaGOo Team</p>`;
  await sendEmail(userEmail, subject, html, text);
  return token; // Return the token for further use (e.g., saving to the database)
};

export const sendRideOtp = async (userEmail: string) => {
  const subject = 'Ride OTP - Verify Your Ride';
  const token = generateToken();
  console.log('Generated OTP:', token);
  const text = `Hello, use the following OTP to verify your ride: ${token}`;
  const html = `<p>Dear Rider,</p>
    <p>You are about to embark on your ride. Please use the OTP below to confirm your ride:</p>
    <p><b style="font-size: 20px;">${token}</b></p>
    <p>Do not share this OTP with anyone.</p>
    <p>Thank you for choosing YaGOo!<br />The YaGOo Team</p>`;
  await sendEmail(userEmail, subject, html, text);
  return token;
};
