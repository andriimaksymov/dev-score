import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import client from '@/api/client';
import LinkedInAnalysisDashboard from '../features/analysis/components/LinkedInAnalysisDashboard';

import type { LinkedInAnalysisResult, LinkedInProfile } from '@/features/analysis/types/analysis.types';

export default function LinkedinAnalysisPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const targetUrl = queryParams.get('url');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<{ analysis: LinkedInAnalysisResult; profile: LinkedInProfile } | null>(null);
  const hasStarted = useRef(false);

  useEffect(() => {
    if (!targetUrl) {
      // Redirect instead of setting state synchronously in effect
      navigate('/');
      return;
    }

    const runAnalysis = async () => {
      if (hasStarted.current) return;
      hasStarted.current = true;

      try {
        const res = await client.post('/linkedin/analyze-url', { url: targetUrl });
        setData(res.data);
        setLoading(false);
      } catch (err: unknown) {
        console.error(err);
        let message = 'Failed to analyze LinkedIn profile.';
        if (typeof err === 'object' && err !== null && 'response' in err) {
          const response = (err as { response?: { data?: { message?: string } } }).response;
          if (response?.data?.message) {
            message = response.data.message;
          }
        }
        setError(message);
        setLoading(false);
      }
    };

    runAnalysis();
  }, [targetUrl, navigate]);

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-slate-50 text-center">
        <Loader2 size={48} className="animate-spin text-blue-600" />
        <h6 className="font-bold text-slate-950">
          Mapping Network...
        </h6>
        <p className="text-sm text-slate-500">Running AI Career Intelligence</p>
      </div>
    );
  }

  if (error || !data?.analysis) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-50 p-8 text-center text-slate-950">
        <h5 className="mb-4 text-2xl font-bold">Analysis failed</h5>
        <p className="mb-8 max-w-md text-red-600">{error || 'The AI engine encountered a timeout. Please verify your profile visibility.'}</p>
        <button
          onClick={() => navigate('/')}
          className="rounded-xl bg-slate-950 px-8 py-4 text-sm font-bold text-white transition-colors hover:bg-slate-800"
        >
          Return Home
        </button>
      </div>
    );
  }

  return <LinkedInAnalysisDashboard analysis={data.analysis} profile={data.profile} />;
}
