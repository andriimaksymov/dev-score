import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface MetricCardProps {
  icon: ReactNode;
  label: string;
  value: string;
  helper?: string;
  trend?: string;
  trendDirection?: 'up' | 'down' | 'neutral';
}

export function MetricCard({
  icon,
  label,
  value,
  helper,
  trend,
  trendDirection = 'neutral',
}: MetricCardProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-5 flex items-start justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
          {icon}
        </div>
        {trend && (
          <span
            className={cn(
              'text-sm font-semibold',
              trendDirection === 'up' && 'text-emerald-600',
              trendDirection === 'down' && 'text-red-600',
              trendDirection === 'neutral' && 'text-slate-500'
            )}
          >
            {trend}
          </span>
        )}
      </div>
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className="mt-2 text-3xl font-bold tracking-tight text-slate-950">{value}</p>
      {helper && <p className="mt-2 text-sm text-slate-500">{helper}</p>}
    </div>
  );
}
