const nodemailer = require("nodemailer");
const env = require("../config/env");

let cachedTransporter = null;

const canSendEmail = () => {
  return Boolean(env.smtpHost && env.smtpUser && env.smtpPass && env.smtpFrom);
};

const getTransporter = () => {
  if (!canSendEmail()) return null;
  if (cachedTransporter) return cachedTransporter;

  cachedTransporter = nodemailer.createTransport({
    host: env.smtpHost,
    port: env.smtpPort,
    secure: env.smtpSecure,
    auth: {
      user: env.smtpUser,
      pass: env.smtpPass,
    },
  });

  return cachedTransporter;
};

const sendEmail = async ({ to, subject, text, html }) => {
  const transporter = getTransporter();
  if (!transporter) {
    throw new Error("Email service is not configured.");
  }

  await transporter.sendMail({
    from: env.smtpFrom,
    to,
    subject,
    text,
    html,
  });
};

module.exports = {
  canSendEmail,
  sendEmail,
};
