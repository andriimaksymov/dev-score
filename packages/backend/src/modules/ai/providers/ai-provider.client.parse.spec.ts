import { ConfigService } from '@nestjs/config';
import { AiProviderClient } from './ai-provider.client';

const configService = {
  get: jest.fn(() => undefined),
} as unknown as ConfigService;

/** Access the private parseJson through a typed harness. */
const buildParser = () => {
  const client = new AiProviderClient(configService);
  return (raw: string): unknown =>
    (client as unknown as { parseJson: (raw: string) => unknown }).parseJson(
      raw,
    );
};

describe('AiProviderClient.parseJson', () => {
  const parseJson = buildParser();

  it('parses plain JSON', () => {
    expect(parseJson('{"a":1}')).toEqual({ a: 1 });
  });

  it('strips markdown code fences', () => {
    expect(parseJson('```json\n{"a":1}\n```')).toEqual({ a: 1 });
  });

  it('recovers a JSON object embedded in prose', () => {
    expect(parseJson('Here is the result: {"a":1} — hope that helps!')).toEqual(
      { a: 1 },
    );
  });

  it('throws a friendly error for garbage', () => {
    expect(() => parseJson('not json at all')).toThrow(
      'Provider response was not valid JSON.',
    );
  });

  it('throws when the embedded object is itself invalid', () => {
    expect(() => parseJson('prefix {"a": } suffix')).toThrow();
  });
});
