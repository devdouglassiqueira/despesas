import { SetMetadata } from '@nestjs/common';

export const PERMISSIONS_GROUP_KEY = 'permissionsGroup';

export const PermissionsGroup = (group: string) =>
  SetMetadata(PERMISSIONS_GROUP_KEY, group);
