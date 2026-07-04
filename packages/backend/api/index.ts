import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import express from 'express';
import type { IncomingMessage, ServerResponse } from 'node:http';
import { AppModule } from '../src/app.module';
import { configureApp } from '../src/app.setup';

/**
 * Vercel serverless entry point for the Nest backend.
 *
 * Vercel invokes this default export per request. A single Express instance and
 * a single initialized Nest app are cached at module scope so warm invocations
 * skip the (expensive) bootstrap. We call `app.init()` — never `listen()` —
 * because the platform owns the network layer; the app only needs its routes
 * and middleware wired onto the shared Express instance.
 *
 * Deploy config lives in `vercel.json`: all paths are routed here, and the
 * app's global `/api` prefix is preserved because the original request URL is
 * passed through to the function.
 */
const server = express();
let ready: Promise<unknown> | null = null;

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, new ExpressAdapter(server));
  configureApp(app);
  await app.init();
}

export default async function handler(
  req: IncomingMessage,
  res: ServerResponse,
): Promise<void> {
  // Cache the bootstrap across warm invocations; run it at most once.
  ready ??= bootstrap();
  await ready;
  // The Express instance is a Node request listener; hand the raw req/res off.
  server(req, res);
}
