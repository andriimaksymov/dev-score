import {
  Injectable,
  Logger,
  UnprocessableEntityException,
} from '@nestjs/common';
import { AiService, CvAnalysisOptions } from '../ai/ai.service';
import { extractPdfTextWithLayout } from '../../common/pdf.util';

@Injectable()
export class CvService {
  private readonly logger = new Logger(CvService.name);

  constructor(private readonly aiService: AiService) {}

  async processCv(buffer: Buffer, options: CvAnalysisOptions = {}) {
    this.logger.log('Processing CV PDF...');

    let text: string;
    try {
      // Preserve the document's line layout so the regenerated résumé PDF can
      // reconstruct headings, bullets and sections instead of one flat blob.
      text = await extractPdfTextWithLayout(buffer);
    } catch (error) {
      // Unreadable/malformed PDF — return a friendly 422, not a 500.
      this.logger.error(
        `CV PDF parse failed: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
      throw new UnprocessableEntityException(
        'We could not read that PDF. Please re-export it and try again.',
      );
    }

    this.logger.log(`Extracted ${text.length} characters from PDF.`);

    // The AI layer has deterministic fallbacks and does not throw.
    const analysis = await this.aiService.generateCvAnalysis(text, options);

    return {
      fullText: text,
      analysis,
    };
  }
}
