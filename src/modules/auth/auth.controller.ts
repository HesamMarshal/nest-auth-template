import { Body, Controller, Post } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { CheckOtpDto, SendOtpDto } from "./dto/otp.dto";
import { SignupDto } from "./dto/basic.dto";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("/send-otp")
  sendOTP(@Body() otpDto: SendOtpDto) {
    return this.authService.sendOTP(otpDto);
  }

  @Post("/check-otp")
  checkOTP(@Body() otpDto: CheckOtpDto) {
    return this.authService.checkOtp(otpDto);
  }

  @Post("/signup")
  signup(@Body() signupDto: SignupDto) {
    return this.authService.signup(signupDto);
  }
}
