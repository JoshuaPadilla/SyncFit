import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { RfidController } from './rfid.controller';
import { RfidService } from './rfid.service';
@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: 'MQTT_SERVICE',
        inject: [ConfigService],
        useFactory: async (configService: ConfigService) => ({
          transport: Transport.MQTT,
          options: {
            url: configService.get<string>('MQTT_BROKER_IP'),
            username: configService.get<string>('MQTT_USERNAME'),
            password: configService.get<string>('MQTT_PASSWORD'),
            clientId: `nestjs_pub_${Math.random().toString(16).slice(2)}`,
            clean: true,
          },
        }),
      },
    ]),
  ],
  controllers: [RfidController],
  providers: [RfidService],
})
export class RfidModule {}
