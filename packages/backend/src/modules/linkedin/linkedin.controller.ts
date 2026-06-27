import { Controller, Post, Body } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { LinkedinService } from './linkedin.service';
import { LinkedInProfileDto } from './dto/linkedin-profile.dto';
import { AnalyzeUrlDto } from './dto/analyze-url.dto';

// Scrapes LinkedIn and/or calls paid AI providers — throttle the whole module.
@Throttle({ default: { ttl: 60_000, limit: 10 } })
@Controller('linkedin')
export class LinkedinController {
  constructor(private readonly linkedinService: LinkedinService) {}

  @Post('analyze-url')
  async analyzeUrl(@Body() { url }: AnalyzeUrlDto) {
    return this.linkedinService.analyzeProfileFromUrl(url);
  }

  @Post('analyze')
  async analyze(@Body() profile: LinkedInProfileDto) {
    return this.linkedinService.analyzeProfile(profile);
  }

  @Post('fetch')
  fetch(@Body() { url }: AnalyzeUrlDto) {
    return this.linkedinService.fetchProfile(url);
  }
}
