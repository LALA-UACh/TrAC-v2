declare namespace NodeJS {
  export interface ProcessEnv {
    SECRET: string;
    DOMAIN: string;
    SENDGRID_API_KEY: string;
    EMAIL_ADDRESS: string;
    EMAIL_ADDRESS_NAME: string;
  }
}
