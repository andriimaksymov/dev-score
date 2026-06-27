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

/** Max accepted upload size — comfortably above any real resume PDF. */
const MAX_CV_BYTES = 8 * 1024 * 1024;

/** A real PDF starts with the "%PDF-" magic header; trust bytes, not headers. */
function isPdf(buffer: Buffer): boolean {
  return buffer.subarray(0, 5).toString('latin1') === '%PDF-';
}

@Controller('cv')
export class CvController {
  constructor(private readonly cvService: CvService) {}

  // Expensive: parses a PDF and calls paid AI providers.
  @Throttle({ default: { ttl: 60_000, limit: 10 } })
  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', { limits: { fileSize: MAX_CV_BYTES, files: 1 } }),
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
