import { useParams } from 'react-router-dom';
import GitHubAnalysisDashboard from '@/features/analysis/components/GitHubAnalysisDashboard';
import { useAnalyzePortfolio } from '@/features/analysis/hooks/useAnalyzePortfolio';
import { AnalysisError, AnalysisPending } from '@/components/shared/AnalysisStatus';
import { ShareReportBar } from '@/components/shared/ShareReportBar';

export default function AnalysisResultsPage() {
  const { username } = useParams<{ username: string }>();
  const {
    data: analysis,
    isPending,
    isError,
    error,
    refetch,
    isRefetching,
  } = useAnalyzePortfolio(username);

  if (!username) {
    return (
      <AnalysisError
        title="No username provided"
        message="Open a profile from the home page or use /analysis/<github-username>."
      />
    );
  }

  if (isPending) {
    return (
      <AnalysisPending
        title="Finalizing AI Report..."
        detail={`Analyzing ${username}'s engineering profile`}
      />
    );
  }

  if (isError) {
    return (
      <AnalysisError
        title="Analysis Failed"
        message={
          error instanceof Error
            ? error.message
            : 'An unexpected error occurred while analyzing this profile.'
        }
        onRetry={() => void refetch()}
      />
    );
  }

  return (
    <>
      <ShareReportBar reportId={analysis.reportId} />
      <GitHubAnalysisDashboard
        analysis={analysis}
        isRescanning={isRefetching}
        onRescan={() => void refetch()}
      />
    </>
  );
}
