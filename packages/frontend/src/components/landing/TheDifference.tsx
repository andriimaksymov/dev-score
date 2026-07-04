import { ArrowUp } from 'lucide-react';

const guarantees = [
  { label: 'No data collection', detail: 'Nothing is stored or logged.' },
  { label: 'Client-side processing', detail: 'Analysis runs in your browser.' },
  { label: 'Open source', detail: 'Inspect exactly what it does.' },
];

const scrollToTool = () => {
  document.getElementById('demo')?.scrollIntoView({ behavior: 'smooth' });
};

export const TheDifference = () => {
  return (
    <section id="privacy" className="bg-ink">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-end">
          <div>
            <span className="font-mono text-xs font-medium uppercase tracking-widest text-violet-400">
              Privacy by design
            </span>
            <h2 className="mt-4 text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl">
              Your profile never leaves your machine.
            </h2>
            <p className="mt-5 max-w-md text-base leading-7 text-slate-400">
              DevScore is built so that the honest read costs you nothing — not your data, not an
              account, not a dollar.
            </p>
            <button
              type="button"
              onClick={scrollToTool}
              className="mt-8 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-ink transition-transform hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-400"
            >
              Analyze my profile
              <ArrowUp className="h-4 w-4" />
            </button>
          </div>

          <dl className="grid gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10 sm:grid-cols-3 lg:grid-cols-1">
            {guarantees.map((item) => (
              <div key={item.label} className="bg-ink p-5">
                <dt className="font-semibold text-white">{item.label}</dt>
                <dd className="mt-1 text-sm text-slate-400">{item.detail}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
};
