import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import { json, urlencoded } from 'express';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Security headers (HSTS, X-Frame-Options, nosniff, a self-only CSP, ...).
  app.use(helmet());

  // Cap request bodies so a large JSON payload can't exhaust memory. File
  // uploads are bounded separately by the CV controller's Multer limits.
  app.use(json({ limit: '1mb' }));
  app.use(urlencoded({ extended: true, limit: '1mb' }));

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // CORS: only allow the configured frontend origin(s), not every caller.
  const frontendUrl =
    configService.get<string>('frontendUrl') ?? 'http://localhost:5173';
  app.enableCors({
    origin: frontendUrl.split(',').map((o) => o.trim()),
    credentials: true,
  });

  // Global prefix
  app.setGlobalPrefix('api');

  const port = configService.get<number>('port') ?? 3001;
  await app.listen(port);

  console.log(`Backend server running on http://localhost:${port}/api`);
}

void bootstrap();
