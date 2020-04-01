import { dbConfig } from "../";

import type { UserConfig } from "../../../constants/userConfig";

export interface IConfiguration {
  name: string;
  value: string;
}

export const CONFIGURATION_TABLE = "configuration";
export const ConfigurationTable = () =>
  dbConfig<IConfiguration>(CONFIGURATION_TABLE);

export interface IUserConfiguration {
  email: string;
  config: UserConfig;
}

export const USER_CONFIGURATION_TABLE = "user_configuration";
export const UserConfigurationTable = () =>
  dbConfig<IUserConfiguration>(USER_CONFIGURATION_TABLE);
