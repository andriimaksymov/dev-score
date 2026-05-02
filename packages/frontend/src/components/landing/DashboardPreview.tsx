import { BarChart3, Shield, TrendingUp, Zap } from 'lucide-react';

const features = [
  {
    title: 'Comprehensive Analysis',
    description: 'Deep insights across technical skills, project impact, and career positioning',
    icon: BarChart3,
  },
  {
    title: 'Actionable Roadmap',
    description: 'Step-by-step recommendations to improve your developer profile',
    icon: TrendingUp,
  },
  {
    title: 'Privacy First',
    description: 'All analysis runs locally. Your data never leaves your browser',
    icon: Shield,
  },
  {
    title: 'Free & Open Source',
    description: 'No sign-up required. Completely free to use and inspect',
    icon: Zap,
  },
];

export const DashboardPreview = () => {
  return (
    <section className="mx-auto grid max-w-7xl gap-6 px-4 pb-16 sm:px-6 md:grid-cols-2 lg:grid-cols-4 lg:px-8">
      {features.map((feature) => {
        const Icon = feature.icon;

        return (
          <div
            className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
            key={feature.title}
          >
            <Icon className="h-8 w-8 text-violet-600" />
            <h3 className="mt-6 font-bold text-slate-950">{feature.title}</h3>
            <p className="mt-3 leading-6 text-slate-500">{feature.description}</p>
          </div>
        );
      })}
    </section>
  );
};
