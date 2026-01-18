import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: Number(process.env.SMTP_PORT) || 587,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export async function sendEmail(to: string, message: string) {
  await transporter.sendMail({
    from: '"Uptime Monitor" <alerts@yourapp.com>',
    to,
    subject: 'Alert Notification',
    text: message,
    html: `<p><strong>${message}</strong></p>`,
  });
}
