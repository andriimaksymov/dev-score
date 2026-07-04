import { Controller, Get, Param } from '@nestjs/common';
import { ReportsService } from './reports.service';

@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  /** Whether history is configured — lets the UI hide the history page cleanly. */
  @Get('status')
  getStatus() {
    return { enabled: this.reportsService.enabled };
  }

  @Get()
  list() {
    return this.reportsService.list();
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.reportsService.get(id);
  }
}
