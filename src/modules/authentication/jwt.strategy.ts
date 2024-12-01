import { BadRequestException, Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy, VerifiedCallback } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { ICustomer } from '@common/index';

import { AuthenticationService } from './authentication.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'customers-jwt') {
  constructor(
    private configService: ConfigService,
    private readonly authService: AuthenticationService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get<string>('JWT_SECRET'),
      ignoreExpiration: false,
    });
  }

  async validate(payload: ICustomer, done: VerifiedCallback) {
    try {
      //TODO: Validate user to check isLogin
      return done(null, payload);
    } catch (error) {
      throw new BadRequestException(error?.message);
    }
  }
}
