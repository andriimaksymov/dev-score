const dimensions = [
  {
    n: '01',
    title: 'Technical depth',
    description:
      'Languages, code quality, and engineering signal read straight from your repositories — not a self-reported skills list.',
  },
  {
    n: '02',
    title: 'Project impact',
    description:
      'What your work actually shipped and reached: scope, activity, and the projects that carry real weight.',
  },
  {
    n: '03',
    title: 'Career positioning',
    description:
      'Trajectory and seniority signal, measured against the role you are actually aiming for.',
  },
  {
    n: '04',
    title: 'Visibility',
    description:
      'How discoverable and legible your work is to a recruiter or hiring manager skimming in 30 seconds.',
  },
];

export const DashboardPreview = () => {
  return (
    <section id="measure" className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
      <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
        <div>
          <span className="font-mono text-xs font-medium uppercase tracking-widest text-violet-600">
            What we measure
          </span>
          <h2 className="mt-4 text-3xl font-bold leading-tight tracking-tight text-ink sm:text-4xl">
            Four signals, one honest score.
          </h2>
          <p className="mt-5 max-w-md text-base leading-7 text-slate-600">
            Every score is backed by evidence pulled from your real profile — so you can see not
            just the number, but exactly what moves it.
          </p>
        </div>

        <div className="grid gap-x-10 gap-y-px sm:grid-cols-2">
          {dimensions.map((dimension) => (
            <div key={dimension.n} className="border-t border-slate-200 py-6">
              <div className="flex items-baseline gap-3">
                <span className="font-mono text-sm font-medium text-violet-600">{dimension.n}</span>
                <h3 className="text-lg font-bold text-ink">{dimension.title}</h3>
              </div>
              <p className="mt-3 text-[15px] leading-7 text-slate-600">{dimension.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
