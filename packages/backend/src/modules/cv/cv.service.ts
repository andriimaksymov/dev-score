import { Injectable, Logger } from '@nestjs/common';
import { AiService, CvAnalysisOptions } from '../ai/ai.service';

import { extractText, getDocumentProxy } from 'unpdf';

@Injectable()
export class CvService {
  private readonly logger = new Logger(CvService.name);

  constructor(private readonly aiService: AiService) {}

  async processCv(buffer: Buffer, options: CvAnalysisOptions = {}) {
    this.logger.log('Processing CV PDF...');

    try {
      // unpdf is a maintained, actively-patched pdf.js wrapper (replacing the
      // unmaintained pdf-parse@1.1.1).
      const pdf = await getDocumentProxy(new Uint8Array(buffer));
      const { text } = await extractText(pdf, { mergePages: true });

      this.logger.log(`Extracted ${text.length} characters from PDF.`);

      // Send to AI for analysis
      const analysis = await this.aiService.generateCvAnalysis(text, options);

      return {
        fullText: text,
        analysis,
      };
    } catch (error: any) {
      this.logger.error('Error during CV processing', error);
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to process CV.';
      throw new Error(errorMessage);
    }
  }
}
