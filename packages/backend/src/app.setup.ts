import { INestApplication, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import { json, urlencoded } from 'express';

/**
 * Applies the shared runtime configuration to a Nest app: security headers,
 * body-size caps, the global validation pipe, env-driven CORS, and the global
 * `/api` prefix.
 *
 * Both entry points call this so they never drift: the local server
 * (`main.ts`, which then calls `listen`) and the Vercel serverless handler
 * (`api/index.ts`, which calls `init` instead).
 */
export function configureApp(app: INestApplication): void {
  const configService = app.get(ConfigService);

  // Security headers (HSTS, X-Frame-Options, nosniff, a self-only CSP, ...).
  app.use(helmet());

  // Cap request bodies so a large JSON payload can't exhaust memory. File
  // uploads are bounded separately by the CV controller's Multer limits.
  app.use(json({ limit: '1mb' }));
  app.use(urlencoded({ extended: true, limit: '1mb' }));

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

  app.setGlobalPrefix('api');
}
