import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import client from '@/api/client';
import CvAnalysisDashboard from '../features/analysis/components/CvAnalysisDashboard';

import type { CvAnalysisResult } from '@/features/analysis/types/analysis.types';

export default function CvAnalysisPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [analysisState, setAnalysisState] = useState<{
    loading: boolean;
    text: string;
    analysis: CvAnalysisResult | null;
    error: string | null;
  }>({
    loading: true,
    text: '',
    analysis: null,
    error: null,
  });

  const file = location.state?.file;

  // Check for file on mount/render
  useEffect(() => {
    if (!file) {
      // Don't set state errors here if we can handle in render, 
      // but to satisfy linter/logic, we'll mark as error state only if not redirecting.
      // Better pattern: redirect if no file.
      navigate('/');
    }
  }, [file, navigate]);

  useEffect(() => {
    if (!file) return;

    const uploadAndAnalyze = async () => {
      const formData = new FormData();
      formData.append('file', file);

      try {
        const res = await client.post('/cv/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });

        setAnalysisState({
          loading: false,
          text: res.data.fullText,
          analysis: res.data.analysis,
          error: null
        });
      } catch (err: unknown) {
        console.error(err);
        let message = 'Failed to analyze CV';
        if (typeof err === 'object' && err !== null && 'response' in err) {
          const response = (err as { response?: { data?: { message?: string } } }).response;
          if (response?.data?.message) {
            message = response.data.message;
          }
        }

        setAnalysisState({
          loading: false,
          text: '',
          analysis: null,
          error: message
        });
      }
    };

    uploadAndAnalyze();
  }, [file]);

  if (analysisState.loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-slate-50 text-center">
        <Loader2 size={48} className="animate-spin text-violet-600" />
        <h6 className="font-bold text-slate-950">
          Parsing PDF Vectors...
        </h6>
        <p className="text-sm text-slate-500">Extracting Semantic Career Entities</p>
      </div>
    );
  }

  if (analysisState.error || !analysisState.analysis) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-50 p-8 text-center text-slate-950">
        <h5 className="mb-4 text-2xl font-bold">Parsing failed</h5>
        <p className="mb-8 max-w-md text-red-600">{analysisState.error || 'The document format is incompatible with our current vector engine.'}</p>
        <button
          onClick={() => navigate('/')}
          className="rounded-xl bg-slate-950 px-8 py-4 text-sm font-bold text-white transition-colors hover:bg-slate-800"
        >
          Return Home
        </button>
      </div>
    );
  }

  return <CvAnalysisDashboard analysis={analysisState.analysis} text={analysisState.text} fileName={file?.name} />;
}
