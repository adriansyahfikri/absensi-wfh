import { SetMetadata } from '@nestjs/common';

// Marks a route as exempt from JwtAuthGuard — used only on POST /auth/login.
export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
