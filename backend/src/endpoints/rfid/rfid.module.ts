import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { RfidController } from './rfid.controller';
import { RfidService } from './rfid.service';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'MQTT_SERVICE', // This name is used for injection
        transport: Transport.MQTT,
        options: {
          url: process.env.MQTT_BROKER_IP,
          username: process.env.MQTT_USERNAME,
          password: process.env.MQTT_PASSWORD,
        },
      },
    ]),
  ],
  controllers: [RfidController],
  providers: [RfidService],
})
export class RfidModule {}
