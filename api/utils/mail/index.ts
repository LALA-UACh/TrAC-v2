import stringify from "json-stringify-safe";
import nodemailer from "nodemailer";
import { MailOptions } from "nodemailer/lib/sendmail-transport";

const GMAIL_USERNAME = process.env.GMAIL_USERNAME;
const GMAIL_PASSWORD = process.env.GMAIL_PASSWORD;

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: GMAIL_USERNAME,
    pass: GMAIL_PASSWORD
  }
});

const mailOptions = {
  from: GMAIL_USERNAME,
  subject: "",
  html: ""
};

export const sendMail = async (
  opts: MailOptions,
  success = (info: any) =>
    console.log("Email sent successfully: " + stringify(info)),
  failure = (err: any) => console.error("Error sending mail: " + stringify(err))
) => {
  if (!GMAIL_USERNAME || !GMAIL_PASSWORD) {
    throw new Error(
      "Put the environment variables GMAIL_USERNAME and GMAIL_PASSWORD"
    );
  }
  return await transporter.sendMail({
    ...mailOptions,
    ...opts
  });
};

export { UnlockMail } from "./mail";
