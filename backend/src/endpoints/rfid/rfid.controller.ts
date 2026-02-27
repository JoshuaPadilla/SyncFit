import { Controller, Param, Post, UseGuards } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { Roles } from 'src/decorators/roles.decorator';
import { UserRole } from 'src/enums/user_role.enums';
import { JwtAuthGuard } from 'src/guards/jwt_auth.guard';
import { RfidService } from './rfid.service';

@Controller('rfid')
export class RfidController {
  constructor(private readonly rfidService: RfidService) {}

  @MessagePattern('gym/rfid/scan')
  handleRfidTap(@Payload() data: any) {
    return this.rfidService.handleRfidTap(data);
  }

  @UseGuards(JwtAuthGuard)
  @Roles(UserRole.ADMIN)
  @Post('register-rfid/:userId')
  registerRfid(@Param('userId') userId: string) {
    return this.rfidService.startRegistration(userId);
  }

  @Roles(UserRole.ADMIN)
  @UseGuards(JwtAuthGuard)
  @Post('cancel-registration')
  cancelRegistration() {
    return this.rfidService.cancelRegistration();
  }
}
