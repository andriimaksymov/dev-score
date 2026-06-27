import { UnprocessableEntityException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { LinkedinService } from './linkedin.service';
import { LinkedinAnalyzer } from './linkedin-analyzer.service';
import * as pdfUtil from '../../common/pdf.util';

describe('LinkedinService', () => {
  let service: LinkedinService;
  let analyzer: { assess: jest.Mock };

  beforeEach(async () => {
    analyzer = {
      assess: jest.fn().mockResolvedValue({
        name: 'Jane Developer',
        targetTitle: 'Senior Frontend Engineer',
        overallScore: 72,
        summary: 'Solid profile.',
        sections: [],
        generatedAt: '2026-06-27T00:00:00.000Z',
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LinkedinService,
        { provide: LinkedinAnalyzer, useValue: analyzer },
      ],
    }).compile();

    service = module.get<LinkedinService>(LinkedinService);
  });

  it('extracts PDF text and delegates to the analyzer', async () => {
    jest
      .spyOn(pdfUtil, 'extractPdfTextWithLayout')
      .mockResolvedValue(
        'Jane Developer\nSenior Frontend Engineer\n' +
          'Experienced engineer who builds accessible, well-tested React apps for product teams.',
      );

    const result = await service.analyzeProfileFromPdf(Buffer.from('%PDF-1.4'));

    expect(analyzer.assess).toHaveBeenCalledTimes(1);
    expect(result.targetTitle).toBe('Senior Frontend Engineer');
    expect(result.overallScore).toBe(72);
  });

  it('returns a friendly 422 when the PDF cannot be read', async () => {
    jest
      .spyOn(pdfUtil, 'extractPdfTextWithLayout')
      .mockRejectedValue(new Error('Invalid PDF structure.'));

    await expect(
      service.analyzeProfileFromPdf(Buffer.from('bad')),
    ).rejects.toBeInstanceOf(UnprocessableEntityException);
    expect(analyzer.assess).not.toHaveBeenCalled();
  });

  it('rejects PDFs with too little readable text', async () => {
    jest.spyOn(pdfUtil, 'extractPdfTextWithLayout').mockResolvedValue('short');

    await expect(
      service.analyzeProfileFromPdf(Buffer.from('%PDF-1.4')),
    ).rejects.toBeInstanceOf(UnprocessableEntityException);
    expect(analyzer.assess).not.toHaveBeenCalled();
  });
});
