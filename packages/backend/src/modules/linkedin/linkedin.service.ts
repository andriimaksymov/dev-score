import {
  Injectable,
  Logger,
  UnprocessableEntityException,
} from '@nestjs/common';
import { AiService } from '../ai/ai.service';
import type { LinkedinAnalysisRequest } from '../ai/ai.service';
import { extractPdfText } from '../../common/pdf.util';

/** Below this, the PDF is almost certainly image-only or not a real profile. */
const MIN_PROFILE_TEXT = 100;

@Injectable()
export class LinkedinService {
  private readonly logger = new Logger(LinkedinService.name);

  constructor(private readonly aiService: AiService) {}

  /**
   * Analyze a LinkedIn profile from its exported PDF: extract the text, then
   * run the AI LinkedIn analysis over it.
   */
  async analyzeProfileFromPdf(buffer: Buffer) {
    const text = await this.extractProfileText(buffer);
    this.logger.log(`Extracted ${text.length} characters from LinkedIn PDF.`);

    const profile = this.buildProfileFromText(text);
    const analysis = await this.aiService.generateLinkedinAnalysis(profile);

    return {
      profile,
      analysis,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Extract text from the uploaded PDF, converting unreadable/malformed PDFs
   * into a friendly 422 (instead of a 500) and logging the real cause.
   */
  private async extractProfileText(buffer: Buffer): Promise<string> {
    let text: string;
    try {
      text = await extractPdfText(buffer);
    } catch (err) {
      this.logger.error(
        `LinkedIn PDF parse failed: ${
          err instanceof Error ? err.message : String(err)
        }`,
      );
      throw new UnprocessableEntityException(
        'We could not read that PDF. Please re-export your LinkedIn profile (More → Save to PDF) and try again.',
      );
    }

    if (text.trim().length < MIN_PROFILE_TEXT) {
      throw new UnprocessableEntityException(
        'That PDF did not contain enough readable text. Make sure you export your profile as a PDF (not a screenshot or image).',
      );
    }

    return text;
  }

  /**
   * Build the AI request from raw PDF text. The full text goes into
   * `profileText` (which the analyzer treats as primary evidence); the display
   * name is a best-effort guess from the first plausible line.
   */
  private buildProfileFromText(text: string): LinkedinAnalysisRequest {
    return {
      fullName: this.guessName(text),
      title: '',
      headline: '',
      about: text.slice(0, 4000),
      profileText: text,
      targetRoles: [],
      experience: [],
      skills: [],
    };
  }

  private guessName(text: string): string {
    const firstLine = text
      .split('\n')
      .map((line) => line.trim())
      .find((line) => line.length > 0);

    // LinkedIn's "Save to PDF" leads with the member's name. Accept a short,
    // digit-free first line as the name; otherwise fall back to a generic label.
    if (
      firstLine &&
      firstLine.length <= 60 &&
      !/\d/.test(firstLine) &&
      firstLine.split(/\s+/).length <= 5
    ) {
      return firstLine;
    }
    return 'Your LinkedIn Profile';
  }
}
