import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create_user.dto';

// PartialType makes all fields in CreateUserDto optional
export class UpdateUserDto extends PartialType(CreateUserDto) {
  // If you allow updating passwords separately, you might want a specific logic,
  // but strictly following the entity:
}
