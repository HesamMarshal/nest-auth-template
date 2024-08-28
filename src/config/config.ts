import { registerAs } from "@nestjs/config";

export enum ConfigKeys {
  App = "App",
  Db = "Db",
  Jwt = "Jwt",
}

const AppConfig = registerAs(ConfigKeys.App, () => ({
  port: 3000,
}));

const DbConfig = registerAs(ConfigKeys.Db, () => {
  return {
    port: 5432,
    host: "localhost",
    username: "postgres",
    password: "123456",
    database: "auth-otp",
  };
});

const JwtConfig = registerAs(ConfigKeys.Jwt, () => ({
  accessTokenSecret: "0f4d1684aec62727d350386415e0f3f35849690a",
  refreshTokenSecret: "7d60febfd9c79bf45ec6126f14dfe69a57444099",
}));

export const configurations = [AppConfig, DbConfig, JwtConfig];
