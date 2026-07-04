import {
  ArrowLeft,
  CalendarDays,
  Code2,
  Download,
  Github,
  Loader2,
  RefreshCw,
  Star,
  TrendingUp,
  Zap,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { DashboardShell } from '@/components/shared/DashboardShell';
import {
  DashboardCard,
  KeywordTag,
  StatusPill,
  CheckItem,
  WarningItem,
} from '@/components/shared/DashboardPrimitives';
import { MetricCard } from '@/components/shared/MetricCard';
import { ScoreRing } from '@/components/shared/ScoreRing';
import type { AnalysisResult } from '../types/analysis.types';

interface GitHubAnalysisDashboardProps {
  analysis: AnalysisResult;
  isRescanning?: boolean;
  onRescan?: () => void;
}

const PRIORITY_STYLES: Record<string, string> = {
  high: 'rounded-md bg-red-50 px-3 py-1 text-sm font-semibold text-red-600',
  medium: 'rounded-md bg-orange-50 px-3 py-1 text-sm font-semibold text-orange-600',
  low: 'rounded-md bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-600',
};

const EFFORT_LABELS: Record<string, string> = {
  short: 'Quick win',
  medium: 'Medium effort',
  long: 'Longer project',
};

const SIGNAL_TONES: Record<string, 'green' | 'blue' | 'orange' | 'slate'> = {
  strong: 'green',
  ok: 'blue',
  weak: 'orange',
  unknown: 'slate',
};

/** Status pills derived from the actual scores — nothing hardcoded. */
const scorePills = (analysis: AnalysisResult) => {
  const pills: { label: string; tone: 'green' | 'orange' }[] = [];
  const { activity, projectQuality, consistency } = analysis.scores;
  if (activity >= 70) pills.push({ label: 'Strong Activity', tone: 'green' });
  else if (activity < 50) pills.push({ label: 'Low Activity', tone: 'orange' });
  if (projectQuality >= 70) pills.push({ label: 'High Quality', tone: 'green' });
  else if (projectQuality < 50) pills.push({ label: 'Quality Needs Work', tone: 'orange' });
  if (consistency >= 70) pills.push({ label: 'Consistent Contributor', tone: 'green' });
  else if (consistency < 50) pills.push({ label: 'Irregular Activity', tone: 'orange' });
  return pills;
};

const EmptyNote = ({ children }: { children: string }) => (
  <p className="mt-4 text-sm text-slate-500">{children}</p>
);

const GitHubAnalysisDashboard = ({
  analysis,
  isRescanning = false,
  onRescan,
}: GitHubAnalysisDashboardProps) => {
  const navigate = useNavigate();
  const exportReport = () => {
    const originalTitle = document.title;

    document.title = `${analysis.username || 'github'}-analysis-report`;
    window.print();
    window.setTimeout(() => {
      document.title = originalTitle;
    }, 500);
  };

  const insights = analysis.aiInsights;
  const projects = insights?.flagshipProjects ?? [];
  const nextActions = insights?.nextActions ?? analysis.nextActions ?? [];
  const roadmap = nextActions.length
    ? nextActions
    : (insights?.improvements ?? analysis.recommendations ?? []).map((item) => ({
        title: item,
        detail: '',
        priority: 'medium' as const,
        metricTag: '',
        effort: 'medium' as const,
        evidenceIds: [],
      }));
  const strengths = analysis.strengths.length ? analysis.strengths : (insights?.keyStrengths ?? []);
  const weaknesses = analysis.weaknesses.length
    ? analysis.weaknesses
    : (insights?.improvements ?? []);
  const qualitySignals = analysis.qualitySignals ?? insights?.qualitySignals ?? [];
  const summary =
    insights?.summary ||
    'No AI summary is available for this profile yet. The scores below are computed directly from public GitHub data.';
  const headline = insights?.profileSummary || analysis.profile.bio || null;

  return (
    <DashboardShell className="github-analysis-report" navWrapperClassName="pdf-screen-only">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <button
            className="pdf-screen-only mb-8 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-950"
            onClick={() => navigate('/')}
            type="button"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </button>

          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-violet-500 to-indigo-500 text-3xl font-bold text-white">
                {analysis.profile.avatarUrl ? (
                  <img
                    className="h-full w-full object-cover"
                    src={analysis.profile.avatarUrl}
                    alt={analysis.username}
                    width={80}
                    height={80}
                    loading="lazy"
                  />
                ) : (
                  analysis.username.slice(0, 1).toUpperCase()
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold tracking-tight text-slate-950">
                    {analysis.username}
                  </h1>
                  <Github className="h-5 w-5 text-slate-500" />
                </div>
                {(headline || analysis.profile.location) && (
                  <p className="mt-2 text-base font-medium text-slate-500">
                    {headline}
                    {headline && analysis.profile.location ? ' • ' : ''}
                    {analysis.profile.location ?? ''}
                  </p>
                )}
                <p className="mt-1 text-sm text-slate-500">
                  {analysis.profile.publicRepos} public repos • {analysis.profile.followers}{' '}
                  followers
                </p>
              </div>
            </div>

            <div className="pdf-screen-only flex gap-3">
              <button
                className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-950 shadow-sm hover:bg-slate-50"
                disabled={isRescanning}
                onClick={onRescan}
                type="button"
              >
                <RefreshCw className={isRescanning ? 'h-4 w-4 animate-spin' : 'h-4 w-4'} />
                {isRescanning ? 'Re-scanning' : 'Re-scan'}
              </button>
              <button
                className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-950 shadow-sm hover:bg-slate-50"
                onClick={exportReport}
                type="button"
              >
                <Download className="h-4 w-4" />
                Export PDF
              </button>
            </div>
          </div>
        </div>
      </section>

      {isRescanning ? (
        <div className="mx-auto max-w-7xl px-4 py-16 text-center sm:px-6 lg:px-8">
          <div className="flex min-h-72 flex-col items-center justify-center rounded-xl border border-slate-200 bg-white shadow-sm">
            <Loader2 className="h-10 w-10 animate-spin text-violet-600" />
            <h2 className="mt-5 text-xl font-bold text-slate-950">Refreshing AI Report...</h2>
            <p className="mt-2 text-sm text-slate-500">
              Re-scanning {analysis.username}'s engineering profile
            </p>
          </div>
        </div>
      ) : (
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[minmax(0,1fr)_384px] lg:px-8">
          <div className="space-y-8">
            <DashboardCard className="grid gap-8 md:grid-cols-[150px_1fr] md:items-center">
              <ScoreRing
                score={analysis.overallScore}
                label="Overall Score"
                color="#10b981"
                size="lg"
              />
              <div>
                <h2 className="text-xl font-bold text-slate-950">Developer Profile Assessment</h2>
                <p className="mt-5 max-w-3xl text-base leading-7 text-slate-500">{summary}</p>
                <div className="mt-6 flex flex-wrap gap-3">
                  {scorePills(analysis).map((pill) => (
                    <StatusPill key={pill.label} tone={pill.tone}>
                      {pill.label}
                    </StatusPill>
                  ))}
                </div>
              </div>
            </DashboardCard>

            <section>
              <h2 className="mb-5 text-xl font-bold text-slate-950">Key Metrics</h2>
              <div className="grid gap-4 md:grid-cols-2">
                <MetricCard
                  icon={<Zap className="h-5 w-5" />}
                  label="Activity Score"
                  value={`${analysis.scores.activity}/100`}
                  helper={
                    insights?.metricInsights?.activity ??
                    `${analysis.profile.publicRepos} public repositories`
                  }
                />
                <MetricCard
                  icon={<Code2 className="h-5 w-5" />}
                  label="Project Quality"
                  value={`${analysis.scores.projectQuality}/100`}
                  helper={
                    insights?.metricInsights?.quality ?? 'Based on repository completeness signals'
                  }
                />
                <MetricCard
                  icon={<TrendingUp className="h-5 w-5" />}
                  label="Tech Stack Diversity"
                  value={`${analysis.scores.techStackDiversity}/100`}
                  helper={
                    insights?.metricInsights?.stack ?? 'Primary languages and tooling breadth'
                  }
                />
                <MetricCard
                  icon={<CalendarDays className="h-5 w-5" />}
                  label="Consistency"
                  value={`${analysis.scores.consistency}/100`}
                  helper={insights?.metricInsights?.consistency ?? 'Contribution rhythm'}
                />
              </div>
            </section>

            <DashboardCard>
              <h2 className="text-xl font-bold text-slate-950">Flagship Repositories</h2>
              {projects.length === 0 ? (
                <EmptyNote>
                  No flagship repositories were identified in this analysis. Public repositories
                  with descriptions, stars, and recent activity surface here.
                </EmptyNote>
              ) : (
                <div className="mt-6 space-y-4">
                  {projects.map((project) => (
                    <article className="rounded-xl border border-slate-200 p-5" key={project.name}>
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className="font-bold text-slate-950">
                            {project.url ? (
                              <a
                                className="hover:underline"
                                href={project.url}
                                rel="noreferrer"
                                target="_blank"
                              >
                                {project.name}
                              </a>
                            ) : (
                              project.name
                            )}
                          </h3>
                          <p className="mt-2 text-sm text-slate-500">{project.reason}</p>
                        </div>
                        <span className="inline-flex items-center gap-1 text-sm text-slate-500">
                          <Star className="h-4 w-4" aria-hidden />
                          {project.stars.toLocaleString()}
                          <span className="sr-only">stars</span>
                        </span>
                      </div>

                      {project.technologies.length > 0 && (
                        <div className="mt-4 flex flex-wrap gap-2">
                          {project.technologies.map((tech) => (
                            <KeywordTag key={tech}>{tech}</KeywordTag>
                          ))}
                        </div>
                      )}

                      {project.improvements?.length > 0 && (
                        <div className="mt-5 border-t border-slate-200 pt-4">
                          <h4 className="text-sm font-bold text-slate-950">
                            Suggested Improvements:
                          </h4>
                          <ul className="mt-3 space-y-2">
                            {project.improvements.map((item) => (
                              <WarningItem key={item}>{item}</WarningItem>
                            ))}
                          </ul>
                        </div>
                      )}
                    </article>
                  ))}
                </div>
              )}
            </DashboardCard>

            <DashboardCard>
              <h2 className="text-xl font-bold text-slate-950">Impact Roadmap</h2>
              {roadmap.length === 0 ? (
                <EmptyNote>
                  No recommendations were generated for this profile. Re-scan after adding more
                  public activity.
                </EmptyNote>
              ) : (
                <div className="mt-6 space-y-4">
                  {roadmap.slice(0, 5).map((action) => (
                    <div
                      className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 p-4"
                      key={action.title}
                    >
                      <div className="flex items-center gap-4">
                        <span className={PRIORITY_STYLES[action.priority] ?? PRIORITY_STYLES.low}>
                          {action.priority.charAt(0).toUpperCase() + action.priority.slice(1)}
                        </span>
                        <div>
                          <p className="font-semibold text-slate-950">{action.title}</p>
                          {action.detail && (
                            <p className="mt-1 text-sm text-slate-500">{action.detail}</p>
                          )}
                        </div>
                      </div>
                      <span className="shrink-0 text-sm font-semibold text-slate-500">
                        {EFFORT_LABELS[action.effort] ?? ''}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </DashboardCard>
          </div>

          <aside className="space-y-6">
            <DashboardCard>
              <h2 className="text-lg font-bold text-slate-950">Quality Signals</h2>
              {qualitySignals.length === 0 ? (
                <EmptyNote>
                  No repository quality signals were collected for this analysis.
                </EmptyNote>
              ) : (
                <div className="mt-6 space-y-5">
                  {qualitySignals.slice(0, 6).map((signal) => (
                    <div key={signal.name}>
                      <div className="mb-2 flex items-center justify-between gap-2 text-sm">
                        <span className="font-medium text-slate-950">{signal.name}</span>
                        <StatusPill tone={SIGNAL_TONES[signal.status] ?? 'slate'}>
                          {signal.status}
                        </StatusPill>
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

            {(insights?.careerPath || insights?.overview) && (
              <DashboardCard>
                <h2 className="text-lg font-bold text-slate-950">Career Direction</h2>
                <ul className="mt-5 space-y-3 text-sm text-slate-700">
                  {insights.careerPath && (
                    <li className="flex gap-3">
                      <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-emerald-500" />
                      {insights.careerPath}
                    </li>
                  )}
                  {insights.overview?.working && (
                    <li className="flex gap-3">
                      <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-blue-500" />
                      {insights.overview.working}
                    </li>
                  )}
                  {insights.overview?.fixFirst && (
                    <li className="flex gap-3">
                      <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-violet-500" />
                      {insights.overview.fixFirst}
                    </li>
                  )}
                </ul>
              </DashboardCard>
            )}

            <DashboardCard>
              <h2 className="text-lg font-bold text-slate-950">Strengths</h2>
              {strengths.length === 0 ? (
                <EmptyNote>
                  No standout strengths were detected yet — more public activity gives the analysis
                  more to work with.
                </EmptyNote>
              ) : (
                <ul className="mt-5 space-y-2">
                  {strengths.slice(0, 4).map((item) => (
                    <CheckItem key={item}>{item}</CheckItem>
                  ))}
                </ul>
              )}
            </DashboardCard>

            <DashboardCard>
              <h2 className="text-lg font-bold text-slate-950">Areas for Growth</h2>
              {weaknesses.length === 0 ? (
                <EmptyNote>No specific growth areas were flagged in this analysis.</EmptyNote>
              ) : (
                <ul className="mt-5 space-y-2">
                  {weaknesses.slice(0, 4).map((item) => (
                    <WarningItem key={item}>{item}</WarningItem>
                  ))}
                </ul>
              )}
            </DashboardCard>
          </aside>
        </div>
      )}
    </DashboardShell>
  );
};

export default GitHubAnalysisDashboard;
