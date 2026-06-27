import { parseLinkedinProfile } from './linkedin-pdf.parser';

// Representative shape of a flattened LinkedIn "Save to PDF" export.
const SAMPLE = `Contact
jane@example.com
www.linkedin.com/in/jane-dev (LinkedIn)

Top Skills
React
TypeScript
Node.js

Languages
English (Native or Bilingual)
Spanish (Professional)

Certifications
AWS Certified Developer

Jane Developer
Senior Frontend Engineer at Acme
San Francisco, California, United States

Summary
Frontend engineer with 8 years building accessible, performant React apps.

Experience
Acme
Senior Frontend Engineer
January 2020 - Present
Led the design system used by 40 engineers.

Education
MIT
BS, Computer Science`;

describe('parseLinkedinProfile', () => {
  const parsed = parseLinkedinProfile(SAMPLE);

  it('extracts the name and headline', () => {
    expect(parsed.name).toBe('Jane Developer');
    expect(parsed.headline).toBe('Senior Frontend Engineer at Acme');
  });

  it('splits the real sections with their content', () => {
    expect(parsed.sections.summary).toContain('Frontend engineer with 8 years');
    expect(parsed.sections.skills).toContain('React');
    expect(parsed.sections.languages).toContain('English');
    expect(parsed.sections.certifications).toContain('AWS Certified Developer');
    expect(parsed.sections.experience).toContain('Led the design system');
    expect(parsed.sections.contact).toContain('jane@example.com');
  });

  it('does not leak identity lines into a section', () => {
    expect(parsed.sections.certifications).not.toContain('Jane Developer');
  });

  it('falls back gracefully when nothing parses', () => {
    const empty = parseLinkedinProfile('just some random text with no headers');
    expect(empty.name).toBe('Your LinkedIn Profile');
    expect(empty.headline).toBe('your target role');
  });
});
