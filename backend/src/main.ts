import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { rawBody: true });

  app.connectMicroservice({
    transport: Transport.MQTT,
    options: {
      subscribeOptions: { qos: 0 }, // Match the QoS in your screenshot
      url: process.env.MQTT_BROKER_IP,
      username: process.env.MQTT_USERNAME,
      password: process.env.MQTT_PASSWORD,
    },
  });

  await app.startAllMicroservices();
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Strips properties that are not in the DTO
      forbidNonWhitelisted: true, // Throws error if extra properties are sent
      transform: true, // Automatically transforms payloads to DTO instances
    }),
  );
  await app.listen(process.env.PORT ?? 3005);
}
bootstrap();
