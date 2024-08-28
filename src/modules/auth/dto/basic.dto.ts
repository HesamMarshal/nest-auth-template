import { IsEmail, IsMobilePhone, IsString, Length } from "class-validator";

export class SignupDto {
  @IsString()
  first_name: string;

  @IsString()
  last_name: string;

  @IsMobilePhone("fa-IR", {}, { message: "Mobile error" })
  mobile: string;

  @IsString()
  @IsEmail(
    { host_whitelist: ["gmail.com", "yahoo.com"] },
    { message: "Your Email is not in correct format" }
  )
  email: string;

  @IsString()
  @Length(6, 20, { message: "Password Length is not in range" })
  pasword: string;

  @IsString()
  confirm_password: string;
}

export class LoginDto {
  @IsString()
  @IsEmail({}, { message: "Your Email is not in correct format" })
  email: string;

  @IsString()
  @Length(6, 20, { message: "Password Length is not in range" })
  pasword: string;
}