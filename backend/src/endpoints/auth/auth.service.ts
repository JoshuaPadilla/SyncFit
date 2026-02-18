import { Injectable } from '@nestjs/common';
import { CreateProfileDto } from 'src/dto/create_user.dto';
import { UserService } from '../user/user.service';

@Injectable()
export class AuthService {
  constructor(private userService: UserService) {}

  async register(createProfileDto: CreateProfileDto) {}
}
