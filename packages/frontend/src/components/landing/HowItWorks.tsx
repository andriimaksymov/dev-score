const steps = [
  {
    title: 'Point it at your work',
    description:
      'Enter a GitHub username, or drop in your LinkedIn or resume PDF. No account, no setup.',
  },
  {
    title: 'The engine reads it',
    description:
      'Code quality, career trajectory, visibility, and positioning — evaluated in seconds.',
  },
  {
    title: 'Act on the score',
    description: 'A scored breakdown with evidence and the specific, ranked moves that raise it.',
  },
];

export const HowItWorks = () => {
  return (
    <section id="how-it-works" className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
      <div className="max-w-2xl">
        <span className="font-mono text-xs font-medium uppercase tracking-widest text-violet-600">
          How it works
        </span>
        <h2 className="mt-4 text-3xl font-bold leading-tight tracking-tight text-ink sm:text-4xl">
          From profile to plan in three steps.
        </h2>
      </div>

      <ol className="mt-12 grid gap-px overflow-hidden rounded-2xl border border-slate-200 bg-slate-200 sm:grid-cols-3">
        {steps.map((step, index) => (
          <li key={step.title} className="bg-canvas p-7 sm:p-8">
            <span className="font-mono text-sm font-medium text-violet-600">
              {String(index + 1).padStart(2, '0')}
            </span>
            <h3 className="mt-5 text-lg font-bold text-ink">{step.title}</h3>
            <p className="mt-3 text-[15px] leading-7 text-slate-600">{step.description}</p>
          </li>
        ))}
      </ol>
    </section>
  );
};
