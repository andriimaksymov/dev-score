import { Module } from '@nestjs/common';
import { LinkedinController } from './linkedin.controller';
import { LinkedinService } from './linkedin.service';
import { LinkedinAnalyzer } from './linkedin-analyzer.service';
import { AiModule } from '../ai/ai.module';
import { ReportsModule } from '../reports/reports.module';

@Module({
  imports: [AiModule, ReportsModule],
  controllers: [LinkedinController],
  providers: [LinkedinService, LinkedinAnalyzer],
})
export class LinkedinModule {}
