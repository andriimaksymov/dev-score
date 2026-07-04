import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { AxiosError, AxiosHeaders } from 'axios';
import { of, throwError } from 'rxjs';
import request from 'supertest';
import { App } from 'supertest/types';
import { ServiceUnavailableException } from '@nestjs/common';
import { AppModule } from './../src/app.module';
import { AiProviderClient } from './../src/modules/ai/providers/ai-provider.client';
import { PrismaService } from './../src/modules/reports/prisma.service';
import * as pdfUtil from './../src/common/pdf.util';

// Intercept PDF text extraction only — the HTTP pipeline (multer limits,
// magic-byte validation, DTO validation, controllers, services, deterministic
// AI fallback) all run for real. isPdf/MAX_PDF_BYTES stay real.
jest.mock('./../src/common/pdf.util', () => {
  const actual = jest.requireActual<typeof pdfUtil>('./../src/common/pdf.util');
  return {
    ...actual,
    extractPdfText: jest.fn(),
    extractPdfTextWithLayout: jest.fn(),
  };
});

const mockedExtractPdfText = pdfUtil.extractPdfText as jest.Mock;
const mockedExtractWithLayout = pdfUtil.extractPdfTextWithLayout as jest.Mock;

/** A buffer that passes the real magic-byte check without being a full PDF. */
const fakePdfBuffer = () => Buffer.from('%PDF-1.4 fake test document body');

const CV_TEXT = `
SUMMARY
Software engineer building web applications with React and Node.js for product teams.

EXPERIENCE
- Responsible for maintaining dashboard features and fixing bugs for customer teams.
- Built reusable React components for analytics workflows and collaborated with backend engineers.
- Maintained TypeScript utilities, reviewed pull requests, and supported production releases.
- Assisted with incident follow-up, documentation updates, and release notes for stakeholders.
- Participated in sprint planning, backlog refinement, and QA validation for dashboards.

SKILLS
React, Node.js, TypeScript, PostgreSQL

PROJECTS
Created a portfolio dashboard using React, TypeScript, REST APIs, and automated tests.

EDUCATION
Bachelor of Science in Computer Science
`;

const LINKEDIN_TEXT = `John Smith
Senior Frontend Engineer at ExampleCo
Contact
john@example.com
www.linkedin.com/in/john-smith
Summary
Frontend engineer with 8 years of experience building React applications for fintech companies, focused on performance and design systems.
Experience
Senior Frontend Engineer
ExampleCo · Full-time
January 2020 - Present
Led the migration to TypeScript and improved dashboard performance by 40%.
Education
BSc Computer Science, Example University
Skills
React · TypeScript · Node.js
`;

const githubProfile = {
  id: 1,
  login: 'octocat',
  name: 'Octo Cat',
  avatar_url: 'https://example.com/a.png',
  html_url: 'https://github.com/octocat',
  bio: 'Test bio',
  company: null,
  blog: '',
  location: 'San Francisco',
  email: null,
  public_repos: 4,
  followers: 12,
  following: 3,
  created_at: '2020-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
};

const githubRepos = [
  {
    id: 10,
    name: 'portfolio-score',
    full_name: 'octocat/portfolio-score',
    html_url: 'https://github.com/octocat/portfolio-score',
    description: 'Developer portfolio analyzer built with NestJS and React',
    fork: false,
    language: 'TypeScript',
    stargazers_count: 8,
    watchers_count: 8,
    forks_count: 1,
    topics: ['nestjs', 'react'],
    homepage: 'https://example.com',
    size: 900,
    default_branch: 'main',
    has_issues: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2026-06-01T00:00:00Z',
    pushed_at: '2026-06-01T00:00:00Z',
  },
];

const githubEvents = [
  {
    id: 'e1',
    type: 'PushEvent',
    actor: { id: 1, login: 'octocat', avatar_url: '' },
    repo: { id: 10, name: 'octocat/portfolio-score', url: '' },
    payload: {},
    public: true,
    created_at: '2026-06-20T10:00:00Z',
  },
];

const axiosErrorWithStatus = (status: number) =>
  new AxiosError(
    `Request failed with status code ${status}`,
    String(status),
    undefined,
    undefined,
    {
      status,
      statusText: 'error',
      data: {},
      headers: new AxiosHeaders(),
      config: { headers: new AxiosHeaders() },
    },
  );

describe('API integration (e2e)', () => {
  let app: INestApplication<App>;
  let githubGet: jest.Mock;

  /** Default GitHub API stub: profile, repos, events, plus repo detail calls. */
  const stubGithubHappyPath = () => {
    githubGet.mockImplementation((url: string) => {
      if (url.includes('/events/public')) return of({ data: githubEvents });
      if (url.includes('/repos?')) return of({ data: githubRepos });
      if (url.includes('/languages'))
        return of({ data: { TypeScript: 12345 } });
      if (url.includes('/contents/'))
        return throwError(() => axiosErrorWithStatus(404));
      if (url.includes('/users/')) return of({ data: githubProfile });
      return throwError(() => axiosErrorWithStatus(404));
    });
  };

  beforeAll(async () => {
    githubGet = jest.fn();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      // Never call real AI providers from tests, even when .env.local holds
      // keys: a null result exercises the deterministic fallback path.
      .overrideProvider(AiProviderClient)
      .useValue({ runStructuredTask: jest.fn().mockResolvedValue(null) })
      .overrideProvider(HttpService)
      .useValue({ get: githubGet })
      // History explicitly not configured — tests must not depend on a DB.
      .overrideProvider(PrismaService)
      .useValue({
        enabled: false,
        get db(): never {
          throw new ServiceUnavailableException(
            'Report history is not configured on this server.',
          );
        },
      })
      .compile();

    app = moduleFixture.createNestApplication();
    // Mirror the production bootstrap (main.ts).
    app.setGlobalPrefix('api');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    githubGet.mockReset();
    mockedExtractPdfText.mockReset();
    mockedExtractWithLayout.mockReset();
  });

  describe('POST /api/analysis/analyze', () => {
    it('returns a full report with deterministic AI fallback', async () => {
      stubGithubHappyPath();

      const response = await request(app.getHttpServer())
        .post('/api/analysis/analyze')
        .send({ username: 'octocat' })
        .expect(201);

      const body = response.body as {
        username: string;
        overallScore: number;
        scores: Record<string, number>;
        aiInsights: { analysisMetadata?: { provider: string } };
        evidence: unknown[];
      };
      expect(body.username).toBe('octocat');
      expect(body.overallScore).toBeGreaterThan(0);
      expect(body.scores.projectQuality).toBeGreaterThan(0);
      expect(body.aiInsights.analysisMetadata?.provider).toBe('deterministic');
      expect(body.evidence.length).toBeGreaterThan(0);
    });

    it('rejects an invalid GitHub username with 400', async () => {
      await request(app.getHttpServer())
        .post('/api/analysis/analyze')
        .send({ username: '../evil/path' })
        .expect(400);
      expect(githubGet).not.toHaveBeenCalled();
    });

    it('maps a GitHub 404 to 404', async () => {
      githubGet.mockImplementation(() =>
        throwError(() => axiosErrorWithStatus(404)),
      );

      await request(app.getHttpServer())
        .post('/api/analysis/analyze')
        .send({ username: 'ghost-user' })
        .expect(404);
    });

    it('maps a GitHub rate limit (403) to 503', async () => {
      githubGet.mockImplementation(() =>
        throwError(() => axiosErrorWithStatus(403)),
      );

      await request(app.getHttpServer())
        .post('/api/analysis/analyze')
        .send({ username: 'octocat' })
        .expect(503);
    });
  });

  describe('POST /api/cv/upload', () => {
    it('analyzes a readable resume PDF', async () => {
      // CvService uses the layout-preserving extractor.
      mockedExtractWithLayout.mockResolvedValue(CV_TEXT);

      const response = await request(app.getHttpServer())
        .post('/api/cv/upload')
        .attach('file', fakePdfBuffer(), 'resume.pdf')
        .field('jobDescription', 'Requires Redis and Terraform experience.')
        .expect(201);

      const body = response.body as {
        fullText: string;
        analysis: {
          summary: { professionalLikelihood: number };
          missingKeywords: string[];
          analysisMetadata?: { provider: string };
        };
      };
      expect(body.fullText).toContain('SUMMARY');
      expect(
        body.analysis.summary.professionalLikelihood,
      ).toBeGreaterThanOrEqual(0);
      expect(body.analysis.missingKeywords).toContain('Redis');
      expect(body.analysis.analysisMetadata?.provider).toBe('deterministic');
    });

    it('rejects a non-PDF upload with 400', async () => {
      await request(app.getHttpServer())
        .post('/api/cv/upload')
        .attach('file', Buffer.from('PK not a pdf'), 'resume.pdf')
        .expect(400);
      expect(mockedExtractWithLayout).not.toHaveBeenCalled();
    });

    it('rejects a missing file with 400', async () => {
      await request(app.getHttpServer()).post('/api/cv/upload').expect(400);
    });

    it('rejects an oversized jobDescription with 400', async () => {
      await request(app.getHttpServer())
        .post('/api/cv/upload')
        .attach('file', fakePdfBuffer(), 'resume.pdf')
        .field('jobDescription', 'x'.repeat(10_001))
        .expect(400);
      expect(mockedExtractWithLayout).not.toHaveBeenCalled();
    });
  });

  describe('reports (history not configured)', () => {
    it('exposes the disabled status', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/reports/status')
        .expect(200);
      expect(response.body).toEqual({ enabled: false });
    });

    it('returns 503 for list and detail', async () => {
      await request(app.getHttpServer()).get('/api/reports').expect(503);
      await request(app.getHttpServer())
        .get('/api/reports/some-id')
        .expect(503);
    });

    it('analysis responses carry reportId: null instead of failing', async () => {
      stubGithubHappyPath();

      const response = await request(app.getHttpServer())
        .post('/api/analysis/analyze')
        .send({ username: 'octocat' })
        .expect(201);

      expect(
        (response.body as { reportId: string | null }).reportId,
      ).toBeNull();
    });
  });

  describe('POST /api/linkedin/analyze-pdf', () => {
    it('returns a section-by-section assessment', async () => {
      mockedExtractWithLayout.mockResolvedValue(LINKEDIN_TEXT);

      const response = await request(app.getHttpServer())
        .post('/api/linkedin/analyze-pdf')
        .attach('file', fakePdfBuffer(), 'profile.pdf')
        .expect(201);

      const body = response.body as {
        name: string;
        targetTitle: string;
        overallScore: number;
        sections: { key: string; present: boolean }[];
      };
      expect(body.name).toBe('John Smith');
      expect(body.targetTitle).toContain('Senior Frontend Engineer');
      expect(body.sections.length).toBeGreaterThan(0);
      expect(body.sections.some((section) => section.present)).toBe(true);
      expect(body.overallScore).toBeGreaterThan(0);
    });

    it('rejects a PDF with too little text with 422', async () => {
      mockedExtractWithLayout.mockResolvedValue('too short');

      await request(app.getHttpServer())
        .post('/api/linkedin/analyze-pdf')
        .attach('file', fakePdfBuffer(), 'profile.pdf')
        .expect(422);
    });
  });
});
