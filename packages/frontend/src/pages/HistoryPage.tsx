import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { FileText, Github, Linkedin } from 'lucide-react';
import { listReports } from '@/features/analysis/api/reportsApi';
import { DashboardShell } from '@/components/shared/DashboardShell';
import { AnalysisPending } from '@/components/shared/AnalysisStatus';
import { ApiError } from '@/api/client';
import type { ReportSummary } from '@/features/analysis/types/analysis.types';

const SOURCE_META: Record<
  ReportSummary['source'],
  { label: string; icon: typeof Github; badge: string }
> = {
  github: { label: 'GitHub', icon: Github, badge: 'bg-slate-100 text-slate-700' },
  linkedin: { label: 'LinkedIn', icon: Linkedin, badge: 'bg-blue-50 text-blue-700' },
  cv: { label: 'Resume', icon: FileText, badge: 'bg-emerald-50 text-emerald-700' },
};

const formatDate = (iso: string) =>
  new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(iso));

/** Recent persisted analyses: /history. */
export default function HistoryPage() {
  const {
    data: reports,
    isPending,
    isError,
    error,
  } = useQuery({
    queryKey: ['reports'],
    queryFn: listReports,
    retry: false,
  });

  if (isPending) {
    return <AnalysisPending title="Loading history..." detail="Fetching recent analyses" />;
  }

  const historyDisabled = isError && error instanceof ApiError && error.status === 503;

  return (
    <DashboardShell>
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold tracking-tight text-slate-950">Analysis History</h1>
        <p className="mt-2 text-sm text-slate-500">
          Recent analyses saved on this server. Every entry has a shareable link.
        </p>

        {historyDisabled ? (
          <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500">
            Report history is not configured on this server. Set <code>DATABASE_URL</code> in the
            backend environment to enable saved, shareable reports.
          </div>
        ) : isError ? (
          <div className="mt-8 rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
            {error instanceof Error ? error.message : 'Failed to load history.'}
          </div>
        ) : reports.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500">
            No analyses saved yet — run one from the{' '}
            <Link className="font-semibold text-violet-600 hover:underline" to="/">
              home page
            </Link>{' '}
            and it will show up here.
          </div>
        ) : (
          <ul className="mt-8 space-y-3">
            {reports.map((report) => {
              const meta = SOURCE_META[report.source];
              const Icon = meta.icon;
              return (
                <li key={report.id}>
                  <Link
                    className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 transition-colors hover:border-violet-300 hover:bg-violet-50/40"
                    to={`/report/${report.id}`}
                  >
                    <span
                      className={`flex h-10 w-10 items-center justify-center rounded-xl ${meta.badge}`}
                    >
                      <Icon className="h-5 w-5" aria-hidden />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-semibold text-slate-950">
                        {report.subject}
                      </span>
                      <span className="mt-0.5 block text-xs text-slate-500">
                        {meta.label} · {formatDate(report.createdAt)}
                      </span>
                    </span>
                    {report.overallScore !== null && (
                      <span className="shrink-0 text-lg font-bold text-slate-950">
                        {report.overallScore}
                        <span className="text-xs font-medium text-slate-400">/100</span>
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </DashboardShell>
  );
}
