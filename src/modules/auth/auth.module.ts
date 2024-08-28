import { Module } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { AuthController } from "./auth.controller";
import { UserEntity } from "../user/entities/user.entity";
import { TypeOrmModule } from "@nestjs/typeorm";
import { OTPEntity } from "../user/entities/otp.entity";

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity, OTPEntity])],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
