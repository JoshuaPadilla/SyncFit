import { PartialType } from '@nestjs/mapped-types';
import { CreateMemberDto } from './create_member.dto';

export class UpdateMemberDto extends PartialType(CreateMemberDto) {}
