import { extractText, getDocumentProxy } from 'unpdf';
import { CvService } from './cv.service';
import { AiService } from '../ai/ai.service';

jest.mock('unpdf', () => ({
  getDocumentProxy: jest.fn(),
  extractText: jest.fn(),
}));

const mockedGetDoc = getDocumentProxy as jest.Mock;
const mockedExtract = extractText as jest.Mock;

describe('CvService', () => {
  let service: CvService;
  let generateCvAnalysis: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockedGetDoc.mockResolvedValue({});
    generateCvAnalysis = jest.fn().mockResolvedValue({ score: 80 });
    const aiService = { generateCvAnalysis } as unknown as AiService;
    service = new CvService(aiService);
  });

  it('extracts text and forwards it (with options) to the AI service', async () => {
    mockedExtract.mockResolvedValue({ text: 'resume text' });
    const buffer = Buffer.from('%PDF-1.4');
    const options = { targetRole: 'Frontend', seniority: 'Senior' };

    const result = await service.processCv(buffer, options);

    expect(mockedGetDoc).toHaveBeenCalled();
    expect(generateCvAnalysis).toHaveBeenCalledWith('resume text', options);
    expect(result).toEqual({
      fullText: 'resume text',
      analysis: { score: 80 },
    });
  });

  it('propagates a controlled error when PDF parsing fails', async () => {
    mockedExtract.mockRejectedValue(new Error('corrupt pdf'));
    await expect(service.processCv(Buffer.from('bad'))).rejects.toThrow(
      'corrupt pdf',
    );
    expect(generateCvAnalysis).not.toHaveBeenCalled();
  });
});
