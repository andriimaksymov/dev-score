import { IsString, IsNotEmpty, Matches } from 'class-validator';

export class AnalyzePortfolioDto {
  @IsString()
  @IsNotEmpty()
  // GitHub's username grammar: alphanumeric or single hyphens, max 39 chars.
  // Rejects path-injection payloads (slashes, dots, query chars) outright.
  @Matches(/^[a-zA-Z0-9](?:[a-zA-Z0-9]|-(?=[a-zA-Z0-9])){0,38}$/, {
    message: 'username must be a valid GitHub username',
  })
  username: string;
}
