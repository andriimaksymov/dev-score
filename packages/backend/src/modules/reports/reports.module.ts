import { Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';

@Module({
  controllers: [ReportsController],
  providers: [PrismaService, ReportsService],
  exports: [ReportsService],
})
export class ReportsModule {}
