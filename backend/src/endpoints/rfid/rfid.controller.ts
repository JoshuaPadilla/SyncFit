import { Controller, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { Roles } from 'src/decorators/roles.decorator';
import { UserRole } from 'src/enums/user_role.enums';
import { JwtAuthGuard } from 'src/guards/jwt_auth.guard';
import { RfidService } from './rfid.service';

@Controller('rfid')
export class RfidController {
  constructor(private readonly rfidService: RfidService) {}

  @EventPattern('door/rfid/scan')
  async handleRfidScan(@Payload() data: any) {
    const result = await this.rfidService.handleRfidScan(data);
    return result;
  }

  @UseGuards(JwtAuthGuard)
  @Roles(UserRole.ADMIN)
  @Post('register-rfid/:userId')
  registerRfid(@Param('userId') userId: string) {
    return this.rfidService.startRegistration(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Roles(UserRole.ADMIN)
  @Post('reassign-rfid/:userId')
  reassignRfid(@Param('userId') userId: string) {
    return this.rfidService.startReassignment(userId);
  }

  @Roles(UserRole.ADMIN)
  @UseGuards(JwtAuthGuard)
  @Post('cancel-registration')
  cancelRegistration() {
    return this.rfidService.cancelRegistration();
  }

  @Roles(UserRole.ADMIN)
  @UseGuards(JwtAuthGuard)
  @Post('cancel-reassignment')
  cancelReassignment() {
    return this.rfidService.cancelReassignment();
  }

  @Roles(UserRole.ADMIN)
  @UseGuards(JwtAuthGuard)
  @Patch('reset-rfid/:userId')
  resetRfid(@Param('userId') userId: string) {
    return this.rfidService.resetRfid(userId);
  }
}
