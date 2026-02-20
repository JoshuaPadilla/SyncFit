import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { RfidService } from './rfid.service';

@Controller()
export class RfidController {
  constructor(private readonly rfidService: RfidService) {}

  @MessagePattern('gym/rfid/scan')
  handleRfidTap(@Payload() data: any) {
    console.log(data);
    return this.rfidService.handleRfidTap(data);
  }
}
