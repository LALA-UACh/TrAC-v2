import { dbConfig } from "../";

interface IConfiguration {
  name: string;
  value: string;
}

export const CONFIGURATION_TABLE = "configuration";
export const ConfigurationTable = () =>
  dbConfig<IConfiguration>(CONFIGURATION_TABLE);
