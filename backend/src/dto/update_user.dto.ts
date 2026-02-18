import { PartialType } from '@nestjs/mapped-types';
import { CreateProfileDto } from './create_user.dto';

// PartialType makes all fields in CreateUserDto optional
export class UpdateProfile extends PartialType(CreateProfileDto) {
  // If you allow updating passwords separately, you might want a specific logic,
  // but strictly following the entity:
}
