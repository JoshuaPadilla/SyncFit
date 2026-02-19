import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateProfileDto } from 'src/dto/create_user.dto';
import { User } from 'src/entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
  ) {}

  async createProfile(
    createProfileDto: CreateProfileDto,
    user: { id: string; email: string },
  ) {
    const newUser = this.userRepo.create({ ...createProfileDto, ...user });

    return await this.userRepo.save(newUser);
  }

  async fetchLoggedUser(userId: string) {
    console.log('User Id:', userId);
    return await this.userRepo.findOne({ where: { id: userId } });
  }
}
