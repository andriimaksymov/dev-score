import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { configureApp } from './app.setup';

// Local / self-hosted entry point: a long-running HTTP server. On Vercel the
// app is served by the serverless handler in `api/index.ts` instead.
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  configureApp(app);

  const port = app.get(ConfigService).get<number>('port') ?? 3001;
  await app.listen(port);

  console.log(`Backend server running on http://localhost:${port}/api`);
}

void bootstrap();
