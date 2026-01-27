import { applyDecorators, UseGuards } from '@nestjs/common';
import { ValidRoles } from '../interfaces/valid-roles';
import { Roles } from './roles.decorator';
import { UserRoleGuard } from '../guards';

export function Auth(...roles: ValidRoles[]) {
  return applyDecorators(Roles(...roles), UseGuards(UserRoleGuard));
}
