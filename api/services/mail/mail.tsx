import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import requireEnv from "require-env-variable";

import { NODE_ENV } from "../../../constants";

const EMAIL_ADDRESS = process.env.EMAIL_ADDRESS_REPLY_TO;

const DOMAIN =
  NODE_ENV === "production"
    ? requireEnv("DOMAIN").DOMAIN
    : "http://localhost:3000";

export const UnlockMail = ({
  email,
  unlockKey,
}: {
  email: string;
  unlockKey: string;
}): string => {
  const link = `${DOMAIN}/unlock/${email}/${unlockKey}`;

  return renderToStaticMarkup(
    <div>
      <h2>Bienvenido/a a la herramienta TrAC!</h2>
      <br />
      <p>
        El equipo LALA ha preparado para usted una cuenta de usuario para
        utilizar la herramienta TrAC. Por seguridad, la cuenta de usuario sólo
        será activada cuando haya establecido una contraseña segura.
      </p>
      <br />
      <p>
        Haga click{" "}
        <a href={link}>
          <b>aquí</b>
        </a>{" "}
        para ingresar una contraseña nueva y activar su cuenta
      </p>
      <br />
      <p>
        O abra este link en su navegador: {"   "}
        <b>{link}</b>
      </p>
      <br />
      <p>
        Si tiene algún problema o alguna pregunta, puede contactarnos al correo:{" "}
        <b>{EMAIL_ADDRESS}</b>
      </p>
    </div>
  );
};
