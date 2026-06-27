import { Controller, Post, Body } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { AnalysisService } from './analysis.service';
import { AnalyzePortfolioDto } from './dto/analyze-portfolio.dto';

@Controller('analysis')
export class AnalysisController {
  constructor(private readonly analysisService: AnalysisService) {}

  // Expensive: fans out to the GitHub API and paid AI providers.
  @Throttle({ default: { ttl: 60_000, limit: 10 } })
  @Post('analyze')
  async analyzePortfolio(@Body() analyzeDto: AnalyzePortfolioDto) {
    return this.analysisService.analyzePortfolio(analyzeDto.username);
  }
}
