import GitHubAnalysisDashboard from '@/features/analysis/components/GitHubAnalysisDashboard';
import { useAnalyzePortfolio } from '@/features/analysis/hooks/useAnalyzePortfolio';
import { useParams, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { ArrowLeft, Loader2 } from 'lucide-react';

export default function AnalysisResultsPage() {
  const { username } = useParams<{ username: string }>();
  const navigate = useNavigate();
  const { mutate: analyzePortfolio, data: analysis, isPending, isError, error } = useAnalyzePortfolio();

  useEffect(() => {
    if (!username) {
      navigate('/');
      return;
    }
    // Trigger analysis on mount
    analyzePortfolio({ username });
  }, [username, analyzePortfolio, navigate]);

  if (isPending) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-slate-50 text-center">
        <Loader2 size={48} className="animate-spin text-violet-600" />
        <h6 className="font-bold text-slate-950">
          Finalizing AI Report...
        </h6>
        <p className="text-sm text-slate-500">Analyzing {username}'s engineering profile</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-slate-50 p-8 text-center">
        <h4 className="text-3xl font-bold text-red-600">
          Analysis Failed
        </h4>
        <p className="max-w-md text-slate-500">
          {error instanceof Error ? error.message : 'An unexpected error occurred while analyzing this profile.'}
        </p>
        <button
          onClick={() => navigate('/')}
          className="mt-4 flex items-center gap-2 rounded-xl bg-slate-950 px-6 py-3 font-bold text-white transition-colors hover:bg-slate-800"
        >
          <ArrowLeft size={18} /> Try Another Profile
        </button>
      </div>
    );
  }

  if (!analysis) return null;

  return <GitHubAnalysisDashboard analysis={analysis} />;
}
