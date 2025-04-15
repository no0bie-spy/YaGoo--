// forgot-pw.ts
import nodemailer from "nodemailer";
import { config } from "dotenv";

config();

// Define the interface for sendMail's response (optional, you can use `any` too)
import { SentMessageInfo } from "nodemailer";

// SMTP transport setup
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: true, // true for port 465, false for other ports
  auth: {
    user: process.env.SMTP_USERNAME,
    pass: process.env.SMTP_PASSWORD,
  },
});

// Function to send the recovery email
export async function sendRecoveryEmail(userEmail: string): Promise<{ token: string; info: any }> {

  const token = (100000 + Math.floor(Math.random() * 900000)).toString();

  const info = await transporter.sendMail({
    from: '"Test User" <node-class@padxu.com>',
    to: userEmail,
    subject: "Password Recovery - Verify Your Email",
    text: "Hello, use the token to verify your email.",
    html: `<p>Dear User,<br />Use this token to verify your email: 
      <b style='font-size: 20px;'>${token}</b><br />
      Do not share this email with anyone.</p>`,
  });

  console.log("Message sent: %s", info.messageId);
  return { token, info };
}
