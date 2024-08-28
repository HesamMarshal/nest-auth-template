import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { UserEntity } from "../user/entities/user.entity";
import { Repository } from "typeorm";
import { OTPEntity } from "../user/entities/otp.entity";
import { CheckOtpDto, SendOtpDto } from "./dto/auth.dto";
import { randomInt } from "crypto";

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
    @InjectRepository(OTPEntity) private otpRepository: Repository<OTPEntity>
  ) {}

  async sendOTP(otpDto: SendOtpDto) {
    const { mobile } = otpDto;
    let user = await this.userRepository.findOneBy({ mobile });

    if (!user) {
      // Create user
      user = this.userRepository.create({
        mobile,
      });
      user = await this.userRepository.save(user);
    }

    await this.createOtpForUser(user);
    return { message: "code sent successfully" };
  }

  // Helper function
  async createOtpForUser(user: UserEntity) {
    // Generate OTP_CODE
    const code = randomInt(10000, 99999).toString();

    const exiresIn = new Date(new Date().getTime() + 1000 * 60 * 2);
    let otp = await this.otpRepository.findOneBy({ userId: user.id });
    if (otp) {
      // OTP exist
      // Update code and expires time

      if (otp.expires_in > new Date())
        throw new BadRequestException("OTP not Expired yet");
      otp.code = code;
      otp.expires_in = exiresIn;
    } else {
      // OTP Not Exist
      otp = this.otpRepository.create({
        code,
        expires_in: exiresIn,
        userId: user.id,
      });
    }
    otp = await this.otpRepository.save(otp);
    user.otpId = otp.id;
    await this.userRepository.save(user);
  }
}
