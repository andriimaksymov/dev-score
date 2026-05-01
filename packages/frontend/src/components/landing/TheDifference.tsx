import { CheckCircle2, Shield } from 'lucide-react';

export const TheDifference = () => {
  return (
    <section id="privacy" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="rounded-2xl bg-indigo-50 px-6 py-12 text-center sm:px-10">
        <Shield className="mx-auto h-16 w-16 text-violet-600" />
        <h2 className="mt-8 text-2xl font-bold text-slate-950">Your Privacy Matters</h2>
        <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-slate-500">
          DevScore is built with privacy as the foundation. All profile analysis happens in your browser.
          We don't store, track, or share your data. Open source and transparent.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-x-6 gap-y-3">
          {['No data collection', 'Open source code', 'Client-side processing'].map((item) => (
            <span className="inline-flex items-center gap-2 text-sm font-medium text-slate-950" key={item}>
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              {item}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
};
