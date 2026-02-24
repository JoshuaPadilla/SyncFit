import { Controller, Param, Post } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { RfidService } from './rfid.service';

@Controller('rfid')
export class RfidController {
  constructor(private readonly rfidService: RfidService) {}

  @MessagePattern('gym/rfid/scan')
  handleRfidTap(@Payload() data: any) {
    console.log(data);
    return this.rfidService.handleRfidTap(data);
  }

  @Post('register-rfid/:userId')
  registerRfid(@Param('userId') userId: string) {
    return this.rfidService.startRegistration(userId);
  }
}
