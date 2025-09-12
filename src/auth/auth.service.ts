// src/auth/auth.service.ts
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { User } from '@prisma/client';
import { UsersService } from '../users/users.service';
import { comparePassword } from 'src/common/utils/hash.utils';

type Role = 'USER' | 'ADMIN';

interface JwtPayload {
  sub: string; // user id
  role: Role;
}

type SafeUser = Omit<User, 'passwordHash'>;

@Injectable()
export class AuthService {
  constructor(
    private readonly users: UsersService,
    private readonly jwt: JwtService,
  ) {}

  /**
   * Valida email/senha. Retorna o usuário sem passwordHash se válido; senão, null.
   * Usado pela LocalStrategy.
   */
  async validateUser(
    email: string,
    password: string,
  ): Promise<SafeUser | null> {
    const user = await this.users.findByEmail(email);
    if (!user) return null;

    const ok = await comparePassword(password, user.passwordHash);
    if (!ok) return null;

    // remove o hash antes de retornar
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash, ...safe } = user;
    return safe;
  }

  /**
   * Gera o JWT de acesso para o usuário autenticado.
   * Usado pelo AuthController após o LocalGuard.
   */
  async login(user: {
    id: string;
    role: Role;
  }): Promise<{ access_token: string }> {
    const payload: JwtPayload = { sub: user.id, role: user.role };
    const access_token = await this.jwt.signAsync(payload);
    return { access_token };
  }
}
