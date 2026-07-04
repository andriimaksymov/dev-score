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
import { UploadCvDto } from './dto/upload-cv.dto';
import { ReportsService } from '../reports/reports.service';
import { MAX_PDF_BYTES, isPdf } from '../../common/pdf.util';

@Controller('cv')
export class CvController {
  constructor(
    private readonly cvService: CvService,
    private readonly reportsService: ReportsService,
  ) {}

  // Expensive: parses a PDF and calls paid AI providers.
  @Throttle({ default: { ttl: 60_000, limit: 10 } })
  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: {
        fileSize: MAX_PDF_BYTES,
        files: 1,
        // Bound the accompanying text fields at the transport layer too;
        // the DTO enforces tighter per-field caps after parsing.
        fields: 5,
        fieldSize: 20_000,
      },
    }),
  )
  async uploadCv(
    @UploadedFile() file: Express.Multer.File | undefined,
    @Body() body: UploadCvDto,
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }
    // Validate by content, not the client-supplied Content-Type, which is
    // trivially spoofable.
    if (!isPdf(file.buffer)) {
      throw new BadRequestException('Only PDF files are supported');
    }

    const result = await this.cvService.processCv(file.buffer, {
      targetRole: body.targetRole,
      seniority: body.seniority,
      jobDescription: body.jobDescription,
    });
    // Best-effort persistence; null when history is not configured.
    const reportId = await this.reportsService.save(
      'cv',
      file.originalname,
      result,
      result.analysis.summary.professionalLikelihood,
    );
    return { ...result, reportId };
  }
}
