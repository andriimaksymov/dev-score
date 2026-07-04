import { Test, TestingModule } from '@nestjs/testing';
import { LinkedinController } from './linkedin.controller';
import { LinkedinService } from './linkedin.service';
import { ReportsService } from '../reports/reports.service';

describe('LinkedinController', () => {
  let controller: LinkedinController;
  const analyzeProfileFromPdf = jest.fn();
  const saveReport = jest.fn();

  beforeEach(async () => {
    analyzeProfileFromPdf.mockReset();
    saveReport.mockReset();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [LinkedinController],
      providers: [
        { provide: LinkedinService, useValue: { analyzeProfileFromPdf } },
        { provide: ReportsService, useValue: { save: saveReport } },
      ],
    }).compile();

    controller = module.get<LinkedinController>(LinkedinController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('attaches the persisted report id to the assessment', async () => {
    analyzeProfileFromPdf.mockResolvedValue({
      name: 'Jane Doe',
      overallScore: 71,
      sections: [],
    });
    saveReport.mockResolvedValue('report-123');

    const file = {
      buffer: Buffer.from('%PDF-1.4 test'),
      originalname: 'profile.pdf',
    } as Express.Multer.File;

    const result = (await controller.analyzePdf(file)) as {
      reportId: string | null;
    };

    expect(saveReport).toHaveBeenCalledWith(
      'linkedin',
      'profile.pdf',
      expect.objectContaining({ name: 'Jane Doe' }),
      71,
    );
    expect(result.reportId).toBe('report-123');
  });
});
