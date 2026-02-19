import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('supabase') {
  handleRequest(err, user, info) {
    if (err || !user) {
      // THIS 'info' LOG IS KEY
      console.log('Guard Info:', info?.message);
      throw err || new UnauthorizedException();
    }
    return user;
  }
}
