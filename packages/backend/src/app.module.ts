import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import configuration from './config/configuration';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AnalysisModule } from './modules/analysis/analysis.module';
import { GithubModule } from './modules/github/github.module';
import { ScoringModule } from './modules/scoring/scoring.module';

import { AiModule } from './modules/ai/ai.module';
import { LinkedinModule } from './modules/linkedin/linkedin.module';
import { CvModule } from './modules/cv/cv.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      // `.env.local` files take precedence (first match wins) so local secrets
      // like OPENROUTER override the committed `.env`.
      envFilePath: [
        '../../.env.local',
        '../.env.local',
        '.env.local',
        '../../.env',
        '../.env',
        '.env',
      ],
      load: [configuration],
    }),
    // Per-IP rate limiting. Default ceiling for all routes; expensive AI
    // endpoints apply a tighter @Throttle on top of this.
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 60 }]),
    AnalysisModule,
    GithubModule,
    ScoringModule,
    AiModule,
    LinkedinModule,
    CvModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // Apply the throttler globally.
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class AppModule {}
