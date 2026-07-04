import { ConfigService } from '@nestjs/config';
import { LinkedinAnalyzer } from './linkedin-analyzer.service';
import { AiProviderClient } from '../ai/providers/ai-provider.client';
import { SECTIONS } from './sections.config';

const configService = {
  get: jest.fn(() => undefined),
} as unknown as ConfigService;

/** Analyzer wired to a provider client with no configured providers. */
const buildAnalyzer = () => {
  const providerClient = new AiProviderClient(configService);
  return {
    analyzer: new LinkedinAnalyzer(providerClient),
    providerClient,
  };
};

const PROFILE_TEXT = `Jane Doe
Senior Backend Engineer at Acme
Contact
jane@example.com
www.linkedin.com/in/jane-doe
Summary
Backend engineer with 7 years of experience designing APIs and event-driven systems for logistics platforms. Led a team of 4 and cut infrastructure cost by 30%.
Experience
Senior Backend Engineer
Acme · Full-time
March 2021 - Present
Designed the order-routing service handling 2M requests/day.
Education
MSc Software Engineering, Tech University
Skills
Node.js · PostgreSQL · Kafka
`;

describe('LinkedinAnalyzer (deterministic path)', () => {
  it('assesses a parsed profile without any AI provider', async () => {
    const { analyzer } = buildAnalyzer();

    const assessment = await analyzer.assess(PROFILE_TEXT);

    expect(assessment.name).toBe('Jane Doe');
    expect(assessment.targetTitle).toContain('Senior Backend Engineer');
    expect(assessment.sections).toHaveLength(SECTIONS.length);
    expect(assessment.overallScore).toBeGreaterThan(0);
    expect(assessment.overallScore).toBeLessThanOrEqual(100);
    expect(assessment.summary).toContain(`${assessment.overallScore}/100`);
  });

  it('marks detected sections present and undetected ones missing with score 0', async () => {
    const { analyzer } = buildAnalyzer();

    const assessment = await analyzer.assess(PROFILE_TEXT);
    const byKey = new Map(assessment.sections.map((s) => [s.key, s]));

    const summarySection = assessment.sections.find(
      (s) => s.present && s.score > 0,
    );
    expect(summarySection).toBeDefined();

    for (const section of assessment.sections) {
      if (!section.present) {
        expect(section.score).toBe(0);
        expect(section.status).toBe('missing');
        // Missing sections still carry actionable advice.
        expect(section.recommendation.length).toBeGreaterThan(0);
      }
    }
    expect(byKey.size).toBe(SECTIONS.length);
  });

  it('spends zero AI calls on absent sections', async () => {
    const { analyzer, providerClient } = buildAnalyzer();
    const spy = jest.spyOn(providerClient, 'runStructuredTask');

    // Minimal profile: only name/headline detected, most sections absent.
    const assessment = await analyzer.assess(
      `Jane Doe\nSenior Backend Engineer at Acme\nSummary\nShort summary line about backend work with measurable outcomes for logistics.\n`,
    );

    const presentCount = assessment.sections.filter((s) => s.present).length;
    // One structured-task attempt per *present* section, never for missing ones.
    expect(spy.mock.calls.length).toBe(presentCount);
  });

  it('uses the AI result when the provider returns a valid section analysis', async () => {
    const { analyzer, providerClient } = buildAnalyzer();
    jest.spyOn(providerClient, 'runStructuredTask').mockResolvedValue({
      data: {
        score: 77,
        status: 'strong',
        currentState: 'Clear, outcome-focused summary.',
        recommendation: 'Tighten the first sentence around the target role.',
        actions: ['Lead with the target role'],
      },
      provider: 'openai',
      model: 'test-model',
      warnings: [],
      confidence: 0.86,
    });

    const assessment = await analyzer.assess(PROFILE_TEXT);
    const scored = assessment.sections.filter((s) => s.present);

    expect(scored.every((s) => s.score === 77)).toBe(true);
    expect(scored.every((s) => s.status === 'strong')).toBe(true);
  });
});
