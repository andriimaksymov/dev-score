/**
 * The LinkedIn profile sections we assess, in display order. Each pulls its
 * content from one or more parsed PDF sections, is analyzed by its own AI call
 * (fanned out in parallel), and is anchored on the member's target title.
 */

/** How a section's content should be scored heuristically (the no-AI path). */
export type SectionKind = 'prose' | 'list' | 'contact' | 'signal';

export interface SectionDef {
  key: string;
  label: string;
  /** Relative weight in the overall score. */
  weight: number;
  /** Shape of the content, used by the heuristic scorer. */
  kind: SectionKind;
  /** Parsed-PDF section keys that provide this section's content. */
  sourceKeys: string[];
  /** For sections not present in a PDF export, detect a signal in the raw text. */
  detectInFullText?: RegExp;
  /** What the AI should evaluate for this section. */
  focus: string;
  /** Clean, generic recommendation used when no AI provider is available. */
  tip: string;
  /** Deterministic action items for the no-AI fallback. */
  actions: string[];
}

export const SECTIONS: SectionDef[] = [
  {
    key: 'about',
    label: 'About / Summary',
    weight: 3,
    kind: 'prose',
    sourceKeys: ['summary'],
    focus:
      'The About/Summary narrative: hook, positioning, specialization, measurable outcomes, and keywords for the target role.',
    tip: 'Open with a one-line hook naming your role and specialty, then 2–3 sentences of measurable impact and the keywords recruiters search for.',
    actions: [
      'Lead with a single sentence naming your role and specialty',
      'Add 2–3 quantified achievements (numbers, scale, outcomes)',
      'Close with the keywords a recruiter for this role would search',
    ],
  },
  {
    key: 'experience',
    label: 'Experience',
    weight: 3,
    kind: 'prose',
    sourceKeys: ['experience'],
    focus:
      'Work experience depth and recency: outcome-driven bullets, scope, recent roles, and relevance to the target role.',
    tip: 'Rewrite each role as outcome-first bullets ("Did X, achieving Y"), quantify scope, and keep your most recent role the most detailed.',
    actions: [
      'Start each bullet with an action verb and an outcome',
      'Quantify scope (users, revenue, latency, team size)',
      'Trim responsibilities; keep achievements relevant to the target role',
    ],
  },
  {
    key: 'skills',
    label: 'Skills',
    weight: 2,
    kind: 'list',
    sourceKeys: ['skills'],
    focus:
      'Skills coverage and relevance: presence of the core hard skills expected for the target role and obvious gaps.',
    tip: 'Put the hard skills most expected for your target role first, and drop generic soft skills that dilute recruiter search relevance.',
    actions: [
      'Pin the 3 most important skills for the target role',
      'Add missing must-have keywords for this role',
      'Seek endorsements on your top skills',
    ],
  },
  {
    key: 'featured',
    label: 'Featured',
    weight: 1,
    kind: 'list',
    sourceKeys: ['featured', 'projects', 'publications'],
    focus:
      'Featured / portfolio: links, posts, projects, or media that prove capability for the target role.',
    tip: 'Feature 2–3 artifacts (a repo, case study, or post) that prove your skills for the target role above the fold.',
    actions: [
      'Add a portfolio, repo, or case-study link',
      'Feature your best post or talk',
      'Keep featured items current and role-relevant',
    ],
  },
  {
    key: 'recommendations',
    label: 'Recommendations',
    weight: 2,
    kind: 'prose',
    sourceKeys: ['recommendations'],
    focus:
      'Social proof: number and quality of recommendations that corroborate the target role.',
    tip: 'Request 2–3 recommendations from recent managers or peers that speak to specific outcomes in your target area.',
    actions: [
      'Request recommendations from recent managers/peers',
      'Ask them to mention specific outcomes',
      'Give recommendations to prompt reciprocity',
    ],
  },
  {
    key: 'certifications',
    label: 'Licenses & Certifications',
    weight: 1,
    kind: 'list',
    sourceKeys: ['certifications', 'honors'],
    focus:
      'Certifications relevance: credentials that strengthen credibility for the target role.',
    tip: 'Add the certifications most valued for your target role, with issue dates, and remove expired or irrelevant ones.',
    actions: [
      'Add role-relevant certifications',
      'Include issue dates and credential IDs',
      'Remove outdated credentials',
    ],
  },
  {
    key: 'languages',
    label: 'Languages',
    weight: 1,
    kind: 'list',
    sourceKeys: ['languages'],
    focus:
      'Languages listed and proficiency, where relevant to the target role or market.',
    tip: 'List languages with proficiency levels where they widen your reach for the target market.',
    actions: [
      'Add languages with proficiency levels',
      'Prioritize languages relevant to your target market',
    ],
  },
  {
    key: 'contact',
    label: 'Contact Info',
    weight: 1,
    kind: 'contact',
    sourceKeys: ['contact'],
    focus:
      'Reachability: presence of a professional email, portfolio/GitHub, and a custom profile URL.',
    tip: 'Add a professional email and a portfolio/GitHub link so recruiters can reach and verify you.',
    actions: [
      'Add a professional contact email',
      'Link your portfolio or GitHub',
      'Set a custom LinkedIn URL',
    ],
  },
  {
    key: 'openToWork',
    label: 'Open to Work',
    weight: 1,
    kind: 'signal',
    sourceKeys: [],
    detectInFullText: /open to work|#opentowork/i,
    focus:
      'Job-seeking signals: whether the profile signals availability for the target role.',
    tip: 'If you are searching, enable "Open to Work" for your target titles (recruiters-only mode keeps it private).',
    actions: [
      'Enable Open to Work for your target titles',
      'Use recruiters-only visibility if discretion is needed',
    ],
  },
];
