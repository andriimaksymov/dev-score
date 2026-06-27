import { Test, TestingModule } from '@nestjs/testing';
import { AiService } from '../ai/ai.service';
import { LinkedinService } from './linkedin.service';
import * as pdfUtil from '../../common/pdf.util';

describe('LinkedinService', () => {
  let service: LinkedinService;
  let aiService: { generateLinkedinAnalysis: jest.Mock };

  beforeEach(async () => {
    aiService = {
      generateLinkedinAnalysis: jest.fn().mockResolvedValue({
        summary: { text: 'Analysis', seniorityGuess: 'Senior' },
        dimensions: {
          overall: 70,
          profile: { score: 70, status: 'Strong', insights: [] },
          headline: { score: 70, status: 'Strong', insights: [] },
          experience: { score: 70, status: 'Strong', insights: [] },
          skills: { score: 70, status: 'Strong', insights: [] },
          branding: { score: 70, status: 'Strong', insights: [] },
        },
        recommendations: {
          headlines: [],
          aboutSuggestions: { missing: '', rewritten: '' },
          experienceEdits: [],
        },
        missingKeywords: [],
        actionPlan: { thisWeek: [], next30Days: [], next60Days: [] },
        sourceLimitations: [],
        nextActions: [],
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [LinkedinService, { provide: AiService, useValue: aiService }],
    }).compile();

    service = module.get<LinkedinService>(LinkedinService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('extracts PDF text, guesses the name, and runs AI analysis', async () => {
    jest
      .spyOn(pdfUtil, 'extractPdfText')
      .mockResolvedValue(
        'Jane Developer\nSenior Frontend Engineer\n' +
          'Experienced engineer who builds accessible, well-tested React and Node.js applications for product teams.',
      );

    const result = await service.analyzeProfileFromPdf(Buffer.from('%PDF-1.4'));

    expect(result.profile.fullName).toBe('Jane Developer');
    // The returned profile is the same object passed to the analyzer.
    expect(result.profile.profileText).toContain('Senior Frontend Engineer');
    expect(aiService.generateLinkedinAnalysis).toHaveBeenCalledTimes(1);
    expect(aiService.generateLinkedinAnalysis).toHaveBeenCalledWith(
      result.profile,
    );
    expect(result.analysis.dimensions.overall).toBe(70);
  });
});
