import { IsEmail, IsEnum, IsString, MinLength } from 'class-validator';
import { UserRole } from 'src/enums/user_role.enums';

export class CreateUserDto {
  @IsEmail()
  email: string;

  // We accept a plain password in the DTO, the service will hash it
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  password: string;

  @IsEnum(UserRole)
  role: UserRole;
}
