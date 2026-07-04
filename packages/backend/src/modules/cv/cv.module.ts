import { Module } from '@nestjs/common';
import { CvController } from './cv.controller';
import { CvService } from './cv.service';
import { AiModule } from '../ai/ai.module';
import { ReportsModule } from '../reports/reports.module';

@Module({
  imports: [AiModule, ReportsModule],
  controllers: [CvController],
  providers: [CvService],
})
export class CvModule {}
