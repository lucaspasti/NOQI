// src/users/users.service.ts
import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { hashPassword } from '../common/utils/hash.utils';

type Role = 'USER' | 'ADMIN';

function sanitize<T extends { passwordHash?: string }>(user: T | null) {
  if (!user) return user;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { passwordHash, ...safe } = user as any;
  return safe;
}

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateUserDto) {
    // Checa duplicidade por e-mail ou username (se fornecido)
    const exists = await this.prisma.user.findFirst({
      where: {
        OR: [
          { email: dto.email },
          ...(dto.username ? [{ username: dto.username }] : []),
        ],
      },
    });
    if (exists) {
      throw new ConflictException('Email ou username já em uso');
    }

    const passwordHash = await hashPassword(dto.password);
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        username: dto.username,
        passwordHash,
        role: (dto.role as Role) ?? 'USER',
      },
    });

    return sanitize(user);
  }

  async findAll() {
    const users = await this.prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return users.map(sanitize);
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('Usuário não encontrado');
    return sanitize(user);
  }

  async update(id: string, dto: UpdateUserDto) {
    const data: Record<string, unknown> = {};

    if (dto.email !== undefined) data.email = dto.email;
    if (dto.username !== undefined) data.username = dto.username;
    if (dto.role !== undefined) data.role = dto.role as Role;
    if (dto.isActive !== undefined) data.isActive = dto.isActive;

    if (dto.password) {
      data.passwordHash = await hashPassword(dto.password);
    }

    try {
      const user = await this.prisma.user.update({
        where: { id },
        data,
      });
      return sanitize(user);
    } catch (e) {
      // Se quiser, trate violação de unique (P2002) e converta para 409
      // if ((e as any)?.code === 'P2002') throw new ConflictException('Email/username já em uso');
      throw e;
    }
  }

  async remove(id: string) {
    const user = await this.prisma.user.delete({ where: { id } });
    return sanitize(user);
  }

  /**
   * Usado pelo AuthService para validação de credenciais.
   * Retorna o usuário COM passwordHash.
   */
  findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }
}
