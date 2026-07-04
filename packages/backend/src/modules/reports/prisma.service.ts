import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaClient } from '@prisma/client';

/**
 * Wraps PrismaClient so the database is strictly optional: without a
 * DATABASE_URL the app boots normally, analyses still run, and only the
 * history/reports endpoints report themselves as not configured. A failed
 * connection at startup degrades the same way instead of crashing boot.
 */
@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);
  private client: PrismaClient | null = null;

  constructor(configService: ConfigService) {
    const databaseUrl = configService.get<string>('DATABASE_URL');
    if (databaseUrl) {
      this.client = new PrismaClient();
    } else {
      this.logger.warn(
        'DATABASE_URL is not set — report history is disabled. Analyses still run normally.',
      );
    }
  }

  get enabled(): boolean {
    return this.client !== null;
  }

  /** The live client; throws a friendly 503 when history is not configured. */
  get db(): PrismaClient {
    if (!this.client) {
      throw new ServiceUnavailableException(
        'Report history is not configured on this server.',
      );
    }
    return this.client;
  }

  async onModuleInit() {
    if (!this.client) return;
    try {
      await this.client.$connect();
      this.logger.log('Connected to the reports database.');
    } catch (error) {
      this.logger.error(
        `Could not connect to the reports database — history disabled: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
      await this.client.$disconnect().catch(() => undefined);
      this.client = null;
    }
  }

  async onModuleDestroy() {
    await this.client?.$disconnect();
  }
}
