import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EntryLog } from 'src/entities/entry_log.entity';
import { User } from 'src/entities/user.entity';
import { SupabaseStrategy } from 'src/strategies/jwt_strategy';
import { UserController } from './user.controller';
import { UserService } from './user.service';

@Module({
  imports: [TypeOrmModule.forFeature([User, EntryLog])],
  controllers: [UserController],
  providers: [UserService, SupabaseStrategy],
})
export class UserModule {}
