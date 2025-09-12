import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly config: ConfigService) {
    const secret = config.get<string>('JWT_SECRET', { infer: true });
    if (!secret) {
      throw new Error('JWT_SECRET não definido no .env');
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret, // agora é string garantido
    });
  }

  async validate(payload: any) {
    return { userId: payload.sub, role: payload.role };
  }
}
