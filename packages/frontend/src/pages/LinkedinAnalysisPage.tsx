import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import client from '@/api/client';
import LinkedInAnalysisDashboard from '../features/analysis/components/LinkedInAnalysisDashboard';

import type {
  LinkedInAnalysisResult,
  LinkedInProfile,
} from '@/features/analysis/types/analysis.types';

export default function LinkedinAnalysisPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const file = (location.state as { file?: File } | null)?.file;

  const [analysisState, setAnalysisState] = useState<{
    loading: boolean;
    analysis: LinkedInAnalysisResult | null;
    profile: LinkedInProfile | null;
    error: string | null;
  }>({ loading: true, analysis: null, profile: null, error: null });

  // No file means the user navigated here directly — send them home to upload.
  useEffect(() => {
    if (!file) navigate('/');
  }, [file, navigate]);

  useEffect(() => {
    if (!file) return;

    const uploadAndAnalyze = async () => {
      const formData = new FormData();
      formData.append('file', file);

      try {
        const res = await client.post('/linkedin/analyze-pdf', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        setAnalysisState({
          loading: false,
          analysis: res.data.analysis,
          profile: res.data.profile,
          error: null,
        });
      } catch (err: unknown) {
        let message = 'Failed to analyze LinkedIn profile.';
        if (typeof err === 'object' && err !== null && 'response' in err) {
          const response = (err as { response?: { data?: { message?: string } } }).response;
          if (response?.data?.message) message = response.data.message;
        }
        setAnalysisState({
          loading: false,
          analysis: null,
          profile: null,
          error: message,
        });
      }
    };

    uploadAndAnalyze();
  }, [file]);

  if (analysisState.loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-slate-50 text-center">
        <Loader2 size={48} className="animate-spin text-blue-600" />
        <h6 className="font-bold text-slate-950">Analyzing your profile…</h6>
        <p className="text-sm text-slate-500">Reading your PDF and scoring each section</p>
      </div>
    );
  }

  if (analysisState.error || !analysisState.analysis || !analysisState.profile) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-50 p-8 text-center text-slate-950">
        <h5 className="mb-4 text-2xl font-bold">Analysis failed</h5>
        <p className="mb-8 max-w-md text-red-600">
          {analysisState.error ||
            'We could not read that LinkedIn PDF. Please try exporting it again.'}
        </p>
        <button
          onClick={() => navigate('/')}
          className="rounded-xl bg-slate-950 px-8 py-4 text-sm font-bold text-white transition-colors hover:bg-slate-800"
        >
          Return Home
        </button>
      </div>
    );
  }

  return (
    <LinkedInAnalysisDashboard analysis={analysisState.analysis} profile={analysisState.profile} />
  );
}
