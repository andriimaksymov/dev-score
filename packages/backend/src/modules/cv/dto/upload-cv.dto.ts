import { IsOptional, IsString, MaxLength } from 'class-validator';

/**
 * Text fields accompanying the CV upload. All are user-controlled free text
 * that flows into the AI prompt, so they get explicit length caps — the
 * global ValidationPipe only protects fields declared on a DTO.
 */
export class UploadCvDto {
  @IsOptional()
  @IsString()
  @MaxLength(200)
  targetRole?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  seniority?: string;

  @IsOptional()
  @IsString()
  @MaxLength(10_000)
  jobDescription?: string;
}
