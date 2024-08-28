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

  async checkOtp(otpDto: CheckOtpDto) {
    const { mobile, code } = otpDto;
    const now = new Date();
    const user = await this.userRepository.findOne({
      where: { mobile },
      relations: { otp: true },
    });
    console.log(user);

    if (!user || !user?.otp)
      throw new UnauthorizedException("Mobile not Found");

    if (user?.otp?.code !== code)
      throw new UnauthorizedException("Otp Code is incorrect");

    if (user?.otp?.expires_in < now)
      throw new UnauthorizedException("OTP  expired");

    if (!user.mobile_verified)
      await this.userRepository.update(
        { id: user.id },
        {
          mobile_verified: true,
        }
      );

    return { message: "Logged In" };
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
