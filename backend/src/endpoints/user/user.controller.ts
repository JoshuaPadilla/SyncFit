import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { CreateProfileDto } from 'src/dto/create_user.dto';
import { UserQueryDto } from 'src/dto/queries_dto/user_query_.dto';
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
  @Get()
  fetchAllUsers(@Request() req, @Query() query: UserQueryDto) {
    return this.userService.fetchAllUsers(req.user.id, query);
  }

  @UseGuards(JwtAuthGuard)
  @Get('logged-user')
  fetchLoggedUser(@Request() req) {
    // console.log(req.user.id);
    return this.userService.fetchLoggedUser(req.user.id);
  }
  @UseGuards(JwtAuthGuard)
  @Get('user-dashboard-insights')
  getUserDashboardInsights(@Request() req) {
    return this.userService.getUserDashboardInsights(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('user-transactions')
  getUserTransactions(@Request() req) {
    return this.userService.getUserTransactions(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/:id')
  fetchUserById(@Param('id') id: string) {
    return this.userService.fetchUserById(id);
  }
}
