import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  Body,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Throttle } from '@nestjs/throttler';
import { CvService } from './cv.service';
import { MAX_PDF_BYTES, isPdf } from '../../common/pdf.util';

@Controller('cv')
export class CvController {
  constructor(private readonly cvService: CvService) {}

  // Expensive: parses a PDF and calls paid AI providers.
  @Throttle({ default: { ttl: 60_000, limit: 10 } })
  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', { limits: { fileSize: MAX_PDF_BYTES, files: 1 } }),
  )
  async uploadCv(
    @UploadedFile() file?: Express.Multer.File,
    @Body('targetRole') targetRole?: string,
    @Body('seniority') seniority?: string,
    @Body('jobDescription') jobDescription?: string,
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }
    // Validate by content, not the client-supplied Content-Type, which is
    // trivially spoofable.
    if (!isPdf(file.buffer)) {
      throw new BadRequestException('Only PDF files are supported');
    }

    return this.cvService.processCv(file.buffer, {
      targetRole,
      seniority,
      jobDescription,
    });
  }
}
