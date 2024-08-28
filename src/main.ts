import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ConfigService } from "@nestjs/config";
import { ValidationPipe } from "@nestjs/common";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Use Our Custom Configurations
  const configService = app.get(ConfigService);
  const port = configService.get("App.port");

  app.useGlobalPipes(new ValidationPipe());

  // Run Server
  await app.listen(port, () => {
    console.log(`http://localhost:${port}`);
  });
}
bootstrap();
