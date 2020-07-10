import type { EmailJSON } from "@sendgrid/helpers/classes/email-address";
import requireEnv from "require-env-variable";

import sgMail from "@sendgrid/mail";

import { IS_PRODUCTION } from "../../../constants";

if (IS_PRODUCTION) {
  requireEnv(
    "SENDGRID_API_KEY",
    "EMAIL_ADDRESS",
    "EMAIL_ADDRESS_NAME",
    "EMAIL_ADDRESS_REPLY_TO"
  );
}

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const from: EmailJSON = {
  email: process.env.EMAIL_ADDRESS,
  name: process.env.EMAIL_ADDRESS_NAME,
};

const replyTo: EmailJSON = {
  email: process.env.EMAIL_ADDRESS_REPLY_TO,
  name: process.env.EMAIL_ADDRESS_NAME,
};

export async function sendMail({
  to,
  subject,
  message,
}: {
  to: string;
  subject: string;
  message: string;
}) {
  return (
    await sgMail.send({
      to,
      from,
      replyTo,
      subject: subject,
      html: message,
    })
  )[0];
}

export { UnlockMail } from "./mail";
