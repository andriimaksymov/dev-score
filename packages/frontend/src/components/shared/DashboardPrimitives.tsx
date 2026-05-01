import type { ReactNode } from 'react';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export function DashboardCard({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <section className={cn('rounded-2xl border border-slate-200 bg-white p-6 shadow-sm', className)}>{children}</section>;
}

export function StatusPill({
  children,
  tone = 'green',
}: {
  children: ReactNode;
  tone?: 'green' | 'orange' | 'blue' | 'purple' | 'red' | 'slate';
}) {
  const tones = {
    green: 'bg-emerald-50 text-emerald-700',
    orange: 'bg-orange-50 text-orange-700',
    blue: 'bg-blue-50 text-blue-700',
    purple: 'bg-violet-50 text-violet-700',
    red: 'bg-red-50 text-red-700',
    slate: 'bg-slate-100 text-slate-600',
  };

  return <span className={cn('rounded-full px-3 py-1 text-sm font-medium', tones[tone])}>{children}</span>;
}

export function CheckItem({ children }: { children: ReactNode }) {
  return (
    <li className="flex gap-3 text-sm leading-6 text-slate-700">
      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
      <span>{children}</span>
    </li>
  );
}

export function WarningItem({ children }: { children: ReactNode }) {
  return (
    <li className="flex gap-3 text-sm leading-6 text-slate-700">
      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-orange-600" />
      <span>{children}</span>
    </li>
  );
}

export function KeywordTag({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-sm font-medium text-indigo-700">
      {children}
    </span>
  );
}
