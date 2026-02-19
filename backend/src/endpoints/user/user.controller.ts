import {
  Body,
  Controller,
  Get,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { CreateProfileDto } from 'src/dto/create_user.dto';
import { JwtAuthGuard } from 'src/guards/jwt_auth.guard';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  createUser(@Request() req, @Body() createProfileDto: CreateProfileDto) {
    return this.userService.createProfile(createProfileDto, req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('logged-user')
  fetchLoggedUser(@Request() req) {
    console.log(req.user);
    // console.log(req.user.id);
    return this.userService.fetchLoggedUser(req.user.id);
  }
}
