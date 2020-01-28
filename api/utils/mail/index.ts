import nodemailer from "nodemailer";
import { MailOptions } from "nodemailer/lib/sendmail-transport";

const GMAIL_USERNAME = process.env.GMAIL_USERNAME;
const GMAIL_PASSWORD = process.env.GMAIL_PASSWORD;

const transporter = nodemailer.createTransport({
  ...(process.env.NODE_ENV === "test"
    ? {
        // host: "smtp.mailtrap.io",
        // port: 2525,
        // auth: {
        //   user: "290b7f836f8459",
        //   pass: "926b8fe03ac0c4",
        // },
      }
    : {
        service: "gmail",
        auth: {
          user: GMAIL_USERNAME,
          pass: GMAIL_PASSWORD,
        },
      }),
});

const mailOptions = {
  from: GMAIL_USERNAME,
  subject: "",
  html: "",
};

export const sendMail = async (opts: MailOptions) => {
  return await transporter.sendMail({
    ...mailOptions,
    ...opts,
  });
};

export { UnlockMail } from "./mail";
