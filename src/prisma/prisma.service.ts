// src/prisma/prisma.service.ts
import { Injectable, INestApplication, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit(): Promise<void> {
    // alguns setups de ESLint veem como "any" (falso positivo); faça cast leve
    await (this.$connect as () => Promise<void>)();
  }

  enableShutdownHooks(app: INestApplication): void {
    this.$on.call(this, 'beforeExit', async () => {
      await app.close();
    });
  }
}
