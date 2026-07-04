import { Controller, Post, Body } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { AnalysisService } from './analysis.service';
import { AnalyzePortfolioDto } from './dto/analyze-portfolio.dto';
import { ReportsService } from '../reports/reports.service';

@Controller('analysis')
export class AnalysisController {
  constructor(
    private readonly analysisService: AnalysisService,
    private readonly reportsService: ReportsService,
  ) {}

  // Expensive: fans out to the GitHub API and paid AI providers.
  @Throttle({ default: { ttl: 60_000, limit: 10 } })
  @Post('analyze')
  async analyzePortfolio(@Body() analyzeDto: AnalyzePortfolioDto) {
    const result = await this.analysisService.analyzePortfolio(
      analyzeDto.username,
    );
    // Best-effort persistence; null when history is not configured.
    const reportId = await this.reportsService.save(
      'github',
      result.username,
      result,
      result.overallScore,
    );
    return { ...result, reportId };
  }
}
