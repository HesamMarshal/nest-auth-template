import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { UserEntity } from "../user/entities/user.entity";
import { Repository } from "typeorm";
import { OTPEntity } from "../user/entities/otp.entity";
import { CheckOtpDto, SendOtpDto } from "./dto/otp.dto";
import { randomInt } from "crypto";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { TokensPayload } from "./types/payload";
import { SignupDto } from "./dto/basic.dto";
import { hashSync, genSaltSync } from "bcrypt";

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
    @InjectRepository(OTPEntity) private otpRepository: Repository<OTPEntity>,
    private jswtService: JwtService,
    private configService: ConfigService
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
    const { accessToken, refreshToken } = this.makeUserToken({
      id: user.id,
      mobile,
    });
    return { accessToken, refreshToken, message: "Logged In" };
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

  makeUserToken(payload: TokensPayload) {
    const accessToken = this.jswtService.sign(payload, {
      secret: this.configService.get("Jwt.accessTokenSecret"),
      expiresIn: "3d",
    });
    const refreshToken = this.jswtService.sign(payload, {
      secret: this.configService.get("Jwt.refreshTokenSecret"),
      expiresIn: "1y",
    });
    return { accessToken, refreshToken };
  }

  async validateAccessToekn(token: string) {
    try {
      const payload = this.jswtService.verify<TokensPayload>(token, {
        secret: this.configService.get("Jwt.accessTokenSecret"),
      });
      if (typeof payload == "object" && payload?.id) {
        const user = await this.userRepository.findOneBy({
          id: payload.id,
        });

        if (!user) {
          throw new UnauthorizedException("Not Logged In");
        }
        return user;
      }
      throw new UnauthorizedException("Not Logged In");
    } catch (error) {
      throw new UnauthorizedException("Not Logged In");
    }
  }

  async signup(signupDto: SignupDto) {
    const { first_name, last_name, mobile, email, password } = signupDto;

    await this.checkEmail(email);
    await this.checkMobile(mobile);

    let hashedPassword = this.hashPassword(password);

    const user = this.userRepository.create({
      first_name,
      last_name,
      mobile,
      email,
      password: hashedPassword,
    });

    await this.userRepository.save(user);
    return { message: "Sign Up OK" };
  }

  async checkEmail(email: string) {
    const user = await this.userRepository.findOneBy({
      email,
    });

    if (user) throw new ConflictException("Email is already exist");
  }
  async checkMobile(mobile: string) {
    const user = await this.userRepository.findOneBy({
      mobile,
    });

    if (user) throw new ConflictException("Mobile is already exist");
  }

  hashPassword(password: string) {
    const salt = genSaltSync(10);
    return hashSync(password, salt);
  }
}
