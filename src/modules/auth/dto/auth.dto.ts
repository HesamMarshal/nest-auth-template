import { IsMobilePhone, IsString, Length } from "class-validator";

export class SendOtpDto {
  @IsMobilePhone("fa-IR", {}, { message: "Mobile is not in correct format" })
  mobile: string;
}
export class CheckOtpDto {
  @IsMobilePhone("fa-IR", {}, { message: "Mobile is not in correct format" })
  mobile: string;
  @IsString()
  @Length(5, 5, { message: "Incorrect code" })
  code: string;
}
