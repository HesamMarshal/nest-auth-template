import { Module } from "@nestjs/common";
import { CustomConfigModule } from "./modules/config/config.module";
import { TypeOrmModule } from "@nestjs/typeorm";
import { TypeOrmDbConfig } from "./config/typeorm.config";

@Module({
  imports: [
    CustomConfigModule,
    TypeOrmModule.forRootAsync({
      useClass: TypeOrmDbConfig,
      inject: [TypeOrmDbConfig],
    }),
  ],
  controllers: [],
  providers: [TypeOrmDbConfig],
})
export class AppModule {}
