import nodemailer from "nodemailer";
import env from "../Ienv"; // Make sure file name matches

// SMTP transport setup
const transporter = nodemailer.createTransport({
  host: env.SMTP_HOST,
  port: Number(env.SMTP_PORT),
  secure: true, // true for port 465, false for other ports
  auth: {
    user: env.SMTP_USERNAME,
    pass: env.SMTP_PASSWORD,
  },
});

// Function to send the recovery email
export async function sendRecoveryEmail(userEmail: string): Promise<{ token: string; info: any }> {
  const token = (100000 + Math.floor(Math.random() * 900000)).toString();

  const info = await transporter.sendMail({
    from: '"YaGOo" <node-class@padxu.com>',
    to: userEmail,
    subject: "Password Recovery - Verify Your Email",
    text: "Hello, use the token to verify your email.",
    html: `<p>Dear User,</p>
          <p>Please use the following token to verify your email address:</p>
          <p><b style="font-size: 20px;">${token}</b></p>
          <p>For your security, do not share this email or verification token with anyone.</p>
          <p>Thank you,<br />The YaGOo Team</p>`,
  });

  console.log("Message sent: %s", info.messageId);
  return { token, info };
}

// Function to send the registration email for riders
export async function sendRiderRegistrationEmail(userEmail: string): Promise<{ token: string; info: any }> {
  const token = (100000 + Math.floor(Math.random() * 900000)).toString();

  const info = await transporter.sendMail({
    from: '"YaGOo" <node-class@padxu.com>',
    to: userEmail,
    subject: "Rider Registration - Verify Your Email",
    text: `Hello, use the following token to verify your email: ${token}`,
    html: `<p>Dear Rider,</p>
           <p>Thank you for registering with YaGOo.</p>
           <p>Please use the following verification token to complete your registration:</p>
           <p><b style="font-size: 20px;">${token}</b></p>
           <p>For your security, do not share this token with anyone.</p>
           <p>Welcome aboard!<br />The YaGOo Team</p>`,
  });

  console.log("Message sent: %s", info.messageId);
  return { token, info };
}

// Function to send the registration email for normal users
export async function sendNormalRegistrationEmail(userEmail: string): Promise<{ token: string; info: any }> {
  const token = (100000 + Math.floor(Math.random() * 900000)).toString();

  const info = await transporter.sendMail({
    from: '"YaGOo" <node-class@padxu.com>',
    to: userEmail,
    subject: "Normal Registration - Verify Your Email",
    text: `Hello, use the following token to verify your email: ${token}`,
    html: `<p>Dear User,</p>
           <p>Thank you for registering with YaGOo.</p>
           <p>Please use the following verification token to complete your registration:</p>
           <p><b style="font-size: 20px;">${token}</b></p>
           <p>For your security, do not share this token with anyone.</p>
           <p>Welcome aboard!<br />The YaGOo Team</p>`,
  });

  console.log("Message sent: %s", info.messageId);
  return { token, info };
}
