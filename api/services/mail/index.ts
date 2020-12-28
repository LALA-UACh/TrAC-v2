import { requireEnv } from "require-env-variable";

import sgMail from "@sendgrid/mail";

type EmailJSON = { email: string; name: string };
import { IS_PRODUCTION } from "../../../client/constants";
import { logger } from "../logger";

const {
  SENDGRID_API_KEY,
  EMAIL_ADDRESS,
  EMAIL_ADDRESS_NAME,
  EMAIL_ADDRESS_REPLY_TO,
} = IS_PRODUCTION
  ? requireEnv(
      "SENDGRID_API_KEY",
      "EMAIL_ADDRESS",
      "EMAIL_ADDRESS_NAME",
      "EMAIL_ADDRESS_REPLY_TO"
    )
  : {
      SENDGRID_API_KEY:
        process.env.SENDGRID_API_KEY ||
        (() => {
          logger.warn(
            "No SENDGRID_API_KEY set, email functionality is disabled"
          );
          return "";
        })(),
      EMAIL_ADDRESS:
        process.env.EMAIL_ADDRESS ||
        (() => {
          logger.warn("No EMAIL_ADDRESS set, email functionality is disabled");
          return "";
        })(),
      EMAIL_ADDRESS_NAME:
        process.env.EMAIL_ADDRESS_NAME ||
        (() => {
          logger.warn(
            "No EMAIL_ADDRESS_NAME set, email functionality is disabled"
          );
          return "";
        })(),
      EMAIL_ADDRESS_REPLY_TO:
        process.env.EMAIL_ADDRESS_REPLY_TO ||
        (() => {
          logger.warn(
            "No EMAIL_ADDRESS_REPLY_TO set, email functionality is disabled"
          );
          return "";
        })(),
    };

if (IS_PRODUCTION) {
}

sgMail.setApiKey(SENDGRID_API_KEY);

const from: EmailJSON = {
  email: EMAIL_ADDRESS,
  name: EMAIL_ADDRESS_NAME,
};

const replyTo: EmailJSON = {
  email: EMAIL_ADDRESS_REPLY_TO,
  name: EMAIL_ADDRESS_NAME,
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
  if (
    !SENDGRID_API_KEY ||
    !EMAIL_ADDRESS ||
    !EMAIL_ADDRESS_REPLY_TO ||
    !EMAIL_ADDRESS_NAME
  ) {
    const err = Error(
      "Error: No Email credentials set via environment variables."
    );
    logger.error(err);
    throw err;
  }
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
