import type { SectionDef } from '../sections.config';

/** Bound the content sent per section call. */
const MAX_CONTENT = 4000;

/**
 * Build the system + user prompts for one section, using that section's own
 * extracted content and the member's target title.
 */
export function buildSectionPrompt(
  def: SectionDef,
  sectionContent: string,
  targetTitle: string,
) {
  const systemPrompt = [
    'You are an expert LinkedIn profile coach and technical recruiter.',
    'You evaluate ONE section of a profile at a time for a specific target role.',
    'Return ONLY a single valid JSON object — no markdown, no commentary.',
    'Rules:',
    `- Judge the section against the target role: "${targetTitle}".`,
    '- "currentState" summarizes what THIS section actually contains today (1–2 sentences). Quote/paraphrase the real content; never invent content that is not in the section text.',
    '- "recommendation" is specific, actionable advice tailored to the target role (1–2 sentences).',
    '- "actions" is 2–4 short, concrete, copy-pasteable steps.',
    '- "score" is 0–100 reflecting how well this section serves the target role. "status" is one of: strong, ok, weak, missing.',
  ].join('\n');

  const userPrompt = [
    `TARGET ROLE: ${targetTitle}`,
    `SECTION: ${def.label}`,
    `WHAT TO ASSESS: ${def.focus}`,
    '',
    `SECTION CONTENT (extracted from the member’s LinkedIn PDF):`,
    sectionContent.slice(0, MAX_CONTENT) || '(empty)',
    '',
    'Return the JSON object now.',
  ].join('\n');

  return { systemPrompt, userPrompt };
}
