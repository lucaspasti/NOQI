// src/auth/auth.controller.ts
import {
  Controller,
  Post,
  UseGuards,
  Request,
  Get,
  HttpCode,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './local-auth.guard';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  // POST /auth/login  -> body: { email, password }
  @UseGuards(LocalAuthGuard)
  @HttpCode(200)
  @Post('login')
  login(@Request() req: any) {
    // req.user vem da LocalStrategy.validate (usuário "safe", sem passwordHash)
    return this.auth.login(req.user);
  }

  // GET /auth/me -> requer Bearer token
  @UseGuards(JwtAuthGuard)
  @Get('me')
  me(@Request() req: any) {
    // req.user vem da JwtStrategy.validate
    return req.user; // { userId, role }
  }
}
