import { extractText, getDocumentProxy } from 'unpdf';
import pdfParse from 'pdf-parse';
import { CvService } from './cv.service';
import { AiService } from '../ai/ai.service';

jest.mock('unpdf', () => ({
  getDocumentProxy: jest.fn(),
  extractText: jest.fn(),
}));
jest.mock('pdf-parse', () => jest.fn());

const mockedGetDoc = getDocumentProxy as jest.Mock;
const mockedExtract = extractText as jest.Mock;
const mockedPdfParse = pdfParse as unknown as jest.Mock;

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

  it('returns a friendly 422 when both parsers fail', async () => {
    mockedExtract.mockRejectedValue(new Error('Invalid PDF structure.'));
    mockedPdfParse.mockRejectedValue(new Error('also bad'));
    await expect(service.processCv(Buffer.from('bad'))).rejects.toThrow(
      'could not read that PDF',
    );
    expect(generateCvAnalysis).not.toHaveBeenCalled();
  });

  it('falls back to pdf-parse when unpdf cannot parse the PDF', async () => {
    mockedExtract.mockRejectedValue(new Error('Invalid PDF structure.'));
    mockedPdfParse.mockResolvedValue({ text: 'recovered resume text' });

    const result = await service.processCv(Buffer.from('%PDF-1.4'));

    expect(mockedPdfParse).toHaveBeenCalled();
    expect(generateCvAnalysis).toHaveBeenCalledWith(
      'recovered resume text',
      {},
    );
    expect(result.fullText).toBe('recovered resume text');
  });
});
