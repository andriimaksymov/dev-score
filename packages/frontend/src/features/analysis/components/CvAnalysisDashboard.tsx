import { lazy, Suspense } from 'react';
import { ArrowLeft, FileText, Loader2, RotateCcw, Sparkles, Target, Wrench } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { DashboardShell } from '@/components/shared/DashboardShell';
import {
  DashboardCard,
  CheckItem,
  KeywordTag,
  StatusPill,
} from '@/components/shared/DashboardPrimitives';
import { MetricCard } from '@/components/shared/MetricCard';
import { ScoreRing } from '@/components/shared/ScoreRing';
import { Skeleton } from '@/components/shared/Skeleton';
import type { CvAnalysisResult } from '@/features/analysis/types/analysis.types';

// Lazily loaded so pdf.js (~0.5 MB) only ships when a resume is being reviewed.
const CvPdfReviewer = lazy(() => import('@/features/analysis/components/CvPdfReviewer'));

interface CvAnalysisDashboardProps {
  /** Null while the analysis is still running or if it failed. */
  analysis: CvAnalysisResult | null;
  text: string;
  fileName?: string;
  file?: File;
  /** True while waiting on the server; drives the skeletons. */
  isAnalyzing?: boolean;
  /** Human-readable message if the analysis request failed. */
  analysisError?: string | null;
  onRetry?: () => void;
}

/** Status pills derived from actual analysis output — nothing invented. */
const summaryPills = (analysis: CvAnalysisResult, score: number) => {
  const pills: { label: string; tone: 'green' | 'orange' }[] = [];
  if (score >= 70) pills.push({ label: 'Strong Foundation', tone: 'green' });
  if (analysis.improvements.length > 0) {
    pills.push({
      label: `${analysis.improvements.length} rewrite${analysis.improvements.length === 1 ? '' : 's'} suggested`,
      tone: 'orange',
    });
  }
  if (analysis.missingKeywords.length > 0) {
    pills.push({
      label: `${analysis.missingKeywords.length} missing keywords`,
      tone: 'orange',
    });
  }
  return pills;
};

/** Placeholder for the metric row + summary while analysis is in flight. */
const AnalysisSkeleton = () => (
  <>
    <div className="grid gap-4 md:grid-cols-3">
      {[0, 1, 2].map((i) => (
        <div key={i} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <Skeleton className="h-10 w-10 rounded-xl" />
          <Skeleton className="mt-5 h-4 w-24" />
          <Skeleton className="mt-3 h-8 w-16" />
        </div>
      ))}
    </div>

    <DashboardCard className="grid gap-8 md:grid-cols-[150px_1fr] md:items-center">
      <Skeleton className="mx-auto h-[130px] w-[130px] rounded-full" />
      <div>
        <Skeleton className="h-6 w-48" />
        <Skeleton className="mt-5 h-4 w-full" />
        <Skeleton className="mt-2 h-4 w-11/12" />
        <Skeleton className="mt-2 h-4 w-2/3" />
        <div className="mt-6 flex gap-3">
          <Skeleton className="h-7 w-32 rounded-full" />
          <Skeleton className="h-7 w-28 rounded-full" />
        </div>
      </div>
    </DashboardCard>
  </>
);

/** Placeholder for the lower keyword/action/priority cards. */
const SidebarSkeleton = () => (
  <div className="mx-auto max-w-[1600px] space-y-6 px-4 pb-8 sm:px-6 lg:px-8">
    <DashboardCard>
      <Skeleton className="h-6 w-48" />
      <div className="mt-5 flex flex-wrap gap-2">
        {['w-20', 'w-24', 'w-16', 'w-28', 'w-20', 'w-14'].map((w, i) => (
          <Skeleton key={i} className={`h-7 rounded-lg ${w}`} />
        ))}
      </div>
    </DashboardCard>
    <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
      {[0, 1, 2].map((i) => (
        <DashboardCard key={i}>
          <Skeleton className="h-5 w-32" />
          <Skeleton className="mt-5 h-4 w-full" />
          <Skeleton className="mt-2 h-4 w-5/6" />
          <Skeleton className="mt-2 h-4 w-2/3" />
        </DashboardCard>
      ))}
    </div>
  </div>
);

const CvAnalysisDashboard = ({
  analysis,
  text,
  fileName,
  file,
  isAnalyzing = false,
  analysisError = null,
  onRetry,
}: CvAnalysisDashboardProps) => {
  const navigate = useNavigate();
  const improvements = analysis?.improvements ?? [];
  const scannedDate = new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date());

  // The original résumé can render from the in-memory file the moment the page
  // opens — it does not depend on the analysis. During loading the right column
  // shows a skeleton; on error it is hidden and an error card explains why.
  const reviewerRightPane = isAnalyzing ? 'loading' : analysisError ? 'hidden' : 'live';
  const showReviewer = isAnalyzing || Boolean(file) || (Boolean(text) && improvements.length > 0);

  const reviewFallback = (
    <div className="flex h-64 items-center justify-center rounded-2xl border border-slate-200 bg-white">
      <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
    </div>
  );

  return (
    <DashboardShell>
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-[1600px] items-center gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <button
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-950"
            onClick={() => navigate('/')}
            type="button"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-600 text-white">
            <FileText className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-slate-950">
              {fileName || 'Resume Scanner'}
            </h1>
            <p className="text-xs text-slate-500">
              {isAnalyzing ? 'Analyzing…' : `Scanned on ${scannedDate}`}
            </p>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-[1600px] space-y-8 px-4 py-6 sm:px-6 lg:px-8">
        {/* Review & Fix — the original PDF renders immediately from the file. */}
        {showReviewer ? (
          <div>
            <div className="mb-4">
              <h2 className="flex items-center gap-2 text-xl font-bold text-slate-950">
                <Sparkles className="h-5 w-5 text-amber-500" />
                Review &amp; Fix
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                {isAnalyzing
                  ? 'Your résumé is on the left. The improved version and suggestions are being generated…'
                  : 'Original on the left with rewritten passages highlighted, fully updated version on the right — click any highlight to see what changed.'}
              </p>
            </div>
            <Suspense fallback={reviewFallback}>
              <CvPdfReviewer
                file={file}
                text={text}
                improvements={improvements}
                rightPane={reviewerRightPane}
              />
            </Suspense>
          </div>
        ) : (
          <DashboardCard>
            <h2 className="text-xl font-bold text-slate-950">Review &amp; Fix</h2>
            <p className="mt-4 text-sm text-slate-500">
              {text
                ? 'No rewrite suggestions were generated for this resume — the analysis did not find passages it could confidently improve.'
                : 'No readable text could be extracted from this PDF, so the side-by-side review is unavailable. Export the resume as a selectable-text PDF and scan it again.'}
            </p>
          </DashboardCard>
        )}

        {isAnalyzing ? (
          <AnalysisSkeleton />
        ) : analysisError ? (
          <DashboardCard className="border-red-200 bg-red-50">
            <div className="flex flex-col items-start gap-3">
              <h2 className="text-lg font-bold text-red-700">Analysis failed</h2>
              <p className="text-sm text-red-700">{analysisError}</p>
              {onRetry && (
                <button
                  onClick={onRetry}
                  className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-red-700"
                  type="button"
                >
                  <RotateCcw className="h-4 w-4" />
                  Try Again
                </button>
              )}
            </div>
          </DashboardCard>
        ) : analysis ? (
          <>
            <div className="grid gap-4 md:grid-cols-3">
              <MetricCard
                icon={<Wrench className="h-5 w-5 text-orange-600" />}
                label="Suggested Rewrites"
                value={`${improvements.length}`}
                helper="Passages the analysis flagged with a concrete fix"
              />
              <MetricCard
                icon={<Target className="h-5 w-5 text-red-600" />}
                label="Missing Keywords"
                value={`${analysis.missingKeywords.length}`}
                helper="Role-relevant terms not found in the resume"
              />
              <MetricCard
                icon={<Sparkles className="h-5 w-5 text-violet-600" />}
                label="Analysis Confidence"
                value={
                  analysis.analysisMetadata
                    ? `${Math.round(analysis.analysisMetadata.confidence * 100)}%`
                    : '—'
                }
                helper={
                  analysis.analysisMetadata
                    ? `Provider: ${analysis.analysisMetadata.provider}`
                    : 'Metadata unavailable'
                }
              />
            </div>

            <DashboardCard className="grid gap-8 md:grid-cols-[150px_1fr] md:items-center">
              <ScoreRing
                score={analysis.summary.professionalLikelihood || 0}
                label="Professional Score"
                color="#f59e0b"
                size="lg"
              />
              <div>
                <h2 className="text-xl font-bold text-slate-950">Executive Summary</h2>
                <p className="mt-5 max-w-3xl text-base leading-7 text-slate-500">
                  {analysis.summary.critique ||
                    'No summary critique was generated for this resume.'}
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  {summaryPills(analysis, analysis.summary.professionalLikelihood || 0).map(
                    (pill) => (
                      <StatusPill key={pill.label} tone={pill.tone}>
                        {pill.label}
                      </StatusPill>
                    )
                  )}
                </div>
              </div>
            </DashboardCard>
          </>
        ) : null}
      </div>

      {isAnalyzing ? (
        <SidebarSkeleton />
      ) : analysis && !analysisError ? (
        <div className="mx-auto max-w-[1600px] space-y-6 px-4 pb-8 sm:px-6 lg:px-8">
          <DashboardCard>
            <h2 className="text-xl font-bold text-slate-950">Missing ATS Keywords</h2>
            {analysis.missingKeywords.length === 0 ? (
              <p className="mt-4 text-sm text-slate-500">
                No missing keywords were detected for the target role — the resume already covers
                the expected terminology.
              </p>
            ) : (
              <>
                <p className="mt-4 text-sm text-slate-500">
                  These keywords are relevant to the target role but were not found in your resume:
                </p>
                <div className="mt-5 flex flex-wrap gap-2">
                  {analysis.missingKeywords.map((keyword) => (
                    <KeywordTag key={keyword}>{keyword}</KeywordTag>
                  ))}
                </div>
                <p className="mt-5 text-sm text-slate-500">
                  Tip: Integrate these naturally into your experience bullets where truthful and
                  relevant
                </p>
              </>
            )}
          </DashboardCard>

          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            <DashboardCard className="border-indigo-200 bg-indigo-50">
              <h2 className="text-lg font-bold text-slate-950">Next Actions</h2>
              {(analysis.nextActions ?? []).length === 0 ? (
                <p className="mt-4 text-sm text-slate-500">
                  No follow-up actions were generated for this resume.
                </p>
              ) : (
                <ul className="mt-5 space-y-3">
                  {(analysis.nextActions ?? []).slice(0, 6).map((action) => (
                    <CheckItem key={action.title}>
                      <span className="font-semibold">{action.title}</span>
                      {action.detail ? ` — ${action.detail}` : ''}
                    </CheckItem>
                  ))}
                </ul>
              )}
            </DashboardCard>

            <DashboardCard>
              <h2 className="text-lg font-bold text-slate-950">Quality Signals</h2>
              {(analysis.qualitySignals ?? []).length === 0 ? (
                <p className="mt-4 text-sm text-slate-500">
                  No quality signals were collected for this scan.
                </p>
              ) : (
                <div className="mt-6 space-y-5">
                  {(analysis.qualitySignals ?? []).map((signal) => (
                    <div key={signal.name}>
                      <div className="mb-2 flex justify-between text-sm">
                        <span className="font-medium text-slate-950">{signal.name}</span>
                        {signal.score !== null && (
                          <span className="font-bold text-slate-950">{signal.score}%</span>
                        )}
                      </div>
                      {signal.score !== null && (
                        <div
                          aria-label={signal.name}
                          aria-valuemax={100}
                          aria-valuemin={0}
                          aria-valuenow={signal.score}
                          className="h-2 rounded-full bg-slate-100"
                          role="progressbar"
                        >
                          <div
                            className="h-2 rounded-full bg-violet-500"
                            style={{ width: `${signal.score}%` }}
                          />
                        </div>
                      )}
                      <p className="mt-2 text-xs text-slate-500">{signal.evidence}</p>
                    </div>
                  ))}
                </div>
              )}
            </DashboardCard>

            <DashboardCard>
              <h2 className="text-lg font-bold text-slate-950">Top Priority</h2>
              {(() => {
                const nextActions = analysis.nextActions ?? [];
                const topPriority =
                  nextActions.find((action) => action.priority === 'high') ?? nextActions[0];
                if (topPriority) {
                  return (
                    <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4">
                      <h3 className="font-bold text-slate-950">{topPriority.title}</h3>
                      <p className="mt-3 text-sm leading-6 text-slate-500">{topPriority.detail}</p>
                    </div>
                  );
                }
                if (improvements.length > 0) {
                  return (
                    <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4">
                      <h3 className="font-bold text-slate-950">Fix the flagged passages first</h3>
                      <p className="mt-3 text-sm leading-6 text-slate-500">
                        Start with the {improvements.length} highlighted rewrite
                        {improvements.length === 1 ? '' : 's'} in the Review &amp; Fix panel above —
                        each one includes a concrete replacement.
                      </p>
                    </div>
                  );
                }
                return (
                  <p className="mt-4 text-sm text-slate-500">
                    No priority action was identified for this resume.
                  </p>
                );
              })()}
            </DashboardCard>
          </div>
        </div>
      ) : null}
    </DashboardShell>
  );
};

export default CvAnalysisDashboard;
