import { SetMetadata } from '@nestjs/common';
import { UserRole } from 'src/enums/user_role.enums';
export const ROLES_KEY = 'roles';
export const Roles = (...roles: [UserRole, ...UserRole[]]) =>
  SetMetadata('roles', roles);
