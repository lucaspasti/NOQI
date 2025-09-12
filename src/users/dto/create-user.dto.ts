// src/user/dto/create-user.dto.ts
import {
  IsEmail,
  IsOptional,
  IsString,
  MinLength,
  Matches,
} from 'class-validator';

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ example: 'alice@example.com' })
  @IsEmail()
  email: string;

  @ApiPropertyOptional({ example: 'alice123' })
  @IsOptional()
  @IsString()
  username?: string;

  @ApiProperty({
    description:
      'Senha forte: min 8 chars, 1 maiúscula, 1 minúscula, 1 número, 1 símbolo',
    example: 'S3nh@Forte!',
  })
  @IsString()
  @MinLength(8, { message: 'A senha deve ter pelo menos 8 caracteres' })
  @Matches(/(?=.*[a-z])/, {
    message: 'A senha deve conter pelo menos uma letra minúscula',
  })
  @Matches(/(?=.*[A-Z])/, {
    message: 'A senha deve conter pelo menos uma letra maiúscula',
  })
  @Matches(/(?=.*\d)/, {
    message: 'A senha deve conter pelo menos um número',
  })
  @Matches(/(?=.*[@$!%*?&])/, {
    message: 'A senha deve conter pelo menos um caractere especial (@$!%*?&)',
  })
  password: string;

  @ApiPropertyOptional({ enum: ['USER', 'ADMIN'], default: 'USER' })
  @IsOptional()
  @IsString()
  role?: 'USER' | 'ADMIN';
}
