import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import * as jwksRsa from 'jwks-rsa';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class SupabaseStrategy extends PassportStrategy(Strategy, 'supabase') {
  constructor() {
    console.log(
      'Strategy Secret Check:',
      process.env.SUPABASE_JWT_SECRET ? 'EXISTS' : 'MISSING',
    );
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      algorithms: ['ES256'],
      secretOrKeyProvider: jwksRsa.passportJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri:
          'https://fjvuqeatnwyjkcsguycp.supabase.co/auth/v1/.well-known/jwks.json',
      }),
    });
  }

  async validate(payload: any) {
    return { id: payload.sub, email: payload.email };
  }
}
