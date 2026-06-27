import {
  BadRequestException,
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Throttle } from '@nestjs/throttler';
import { LinkedinService } from './linkedin.service';
import { MAX_PDF_BYTES, isPdf } from '../../common/pdf.util';

// Parses a PDF and calls paid AI providers — throttle the whole module.
@Throttle({ default: { ttl: 60_000, limit: 10 } })
@Controller('linkedin')
export class LinkedinController {
  constructor(private readonly linkedinService: LinkedinService) {}

  @Post('analyze-pdf')
  @UseInterceptors(
    FileInterceptor('file', { limits: { fileSize: MAX_PDF_BYTES, files: 1 } }),
  )
  async analyzePdf(@UploadedFile() file?: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }
    // Validate by content, not the spoofable client Content-Type.
    if (!isPdf(file.buffer)) {
      throw new BadRequestException('Only PDF files are supported');
    }

    return this.linkedinService.analyzeProfileFromPdf(file.buffer);
  }
}
