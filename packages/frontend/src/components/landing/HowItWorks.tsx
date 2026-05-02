const steps = [
  {
    title: 'Connect Your Profile',
    description: 'Enter your GitHub username, LinkedIn URL, or upload your resume PDF',
  },
  {
    title: 'AI-Powered Analysis',
    description:
      'Our engine evaluates code quality, career trajectory, visibility, and positioning',
  },
  {
    title: 'Get Actionable Insights',
    description:
      'Review your score, identify gaps, and follow personalized improvement recommendations',
  },
];

export const HowItWorks = () => {
  return (
    <section id="how-it-works" className="mx-auto max-w-4xl px-4 py-2 sm:px-6 lg:px-8">
      <h2 className="text-center text-2xl font-bold text-slate-950">How It Works</h2>
      <div className="mt-12 space-y-10">
        {steps.map((step, index) => (
          <div className="grid gap-6 sm:grid-cols-[48px_1fr] sm:items-start" key={step.title}>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 text-base font-bold text-violet-600">
              {index + 1}
            </div>
            <div>
              <h3 className="font-bold text-slate-950">{step.title}</h3>
              <p className="mt-3 text-base text-slate-500">{step.description}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
