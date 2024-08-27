import { registerAs } from "@nestjs/config";

export enum ConfigKeys {
  App = "App",
  Db = "Db",
}

const AppConfig = registerAs(ConfigKeys.App, () => {
  return {
    port: 3000,
  };
});
const DbConfig = registerAs(ConfigKeys.Db, () => {
  return {
    port: 3000,
    host: "localhost",
    username: "postgres",
    password: "123456",
    database: "auth-otp",
  };
});

export const configurations = [AppConfig, DbConfig];
