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
 * passed through to the function. Vercel's schema rejects unknown keys in
 * vercel.json (even "$comment"), so its rationale lives here instead:
 * CORS is handled exclusively by the Nest app (enableCors in app.setup.ts,
 * driven by FRONTEND_URL) — do NOT add static CORS headers to vercel.json;
 * they would silently override the env-driven config. maxDuration is raised
 * for the AI analysis calls (Hobby caps at 60s; Pro allows more).
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
