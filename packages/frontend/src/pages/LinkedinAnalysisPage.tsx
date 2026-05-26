import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import client from '@/api/client';
import LinkedInAnalysisDashboard from '../features/analysis/components/LinkedInAnalysisDashboard';

import type {
  LinkedInAnalysisResult,
  LinkedInProfile,
} from '@/features/analysis/types/analysis.types';

type PageStep = 'loading' | 'enrich' | 'result' | 'error';

interface ScrapeData {
  analysis: LinkedInAnalysisResult;
  profile: LinkedInProfile;
}

export default function LinkedinAnalysisPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const targetUrl = queryParams.get('url');

  const [step, setStep] = useState<PageStep>('loading');
  const [error, setError] = useState<string | null>(null);
  const [scrapeData, setScrapeData] = useState<ScrapeData | null>(null);

  // Enrich form state
  const [aboutText, setAboutText] = useState('');
  const [skillsText, setSkillsText] = useState('');
  const [enrichLoading, setEnrichLoading] = useState(false);
  const [enrichError, setEnrichError] = useState<string | null>(null);

  const hasStarted = useRef(false);

  useEffect(() => {
    if (!targetUrl) {
      navigate('/');
      return;
    }
    if (hasStarted.current) return;
    hasStarted.current = true;

    const runScrape = async () => {
      try {
        const res = await client.post('/linkedin/analyze-url', { url: targetUrl });
        const data: ScrapeData = res.data;
        setScrapeData(data);

        // Show enrich form if data is sparse (no about text and source limitations present)
        const isSparse =
          !data.profile.about &&
          (data.analysis.sourceLimitations?.length ?? 0) > 0;

        setStep(isSparse ? 'enrich' : 'result');
      } catch (err: unknown) {
        console.error(err);
        let message = 'Failed to analyze LinkedIn profile.';
        if (typeof err === 'object' && err !== null && 'response' in err) {
          const response = (err as { response?: { data?: { message?: string } } }).response;
          if (response?.data?.message) message = response.data.message;
        }
        setError(message);
        setStep('error');
      }
    };

    runScrape();
  }, [targetUrl, navigate]);

  const handleEnrichSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scrapeData) return;

    setEnrichLoading(true);
    setEnrichError(null);

    try {
      const skills = skillsText
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      const res = await client.post('/linkedin/analyze', {
        fullName: scrapeData.profile.fullName,
        title: scrapeData.profile.title ?? '',
        headline: scrapeData.profile.headline ?? '',
        about: aboutText,
        profileText: [scrapeData.profile.title, aboutText].filter(Boolean).join('\n\n'),
        targetRoles: [],
        experience: [],
        skills,
        avatarUrl: scrapeData.profile.avatarUrl,
      });

      setScrapeData(res.data);
      setStep('result');
    } catch (err: unknown) {
      let message = 'Failed to run analysis. Please try again.';
      if (typeof err === 'object' && err !== null && 'response' in err) {
        const response = (err as { response?: { data?: { message?: string } } }).response;
        if (response?.data?.message) message = response.data.message;
      }
      setEnrichError(message);
    } finally {
      setEnrichLoading(false);
    }
  };

  const handleSkip = () => setStep('result');

  if (step === 'loading') {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-slate-50 text-center">
        <Loader2 size={48} className="animate-spin text-blue-600" />
        <h6 className="font-bold text-slate-950">Scanning LinkedIn Profile…</h6>
        <p className="text-sm text-slate-500">Fetching public profile data</p>
      </div>
    );
  }

  if (step === 'enrich' && scrapeData) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4 py-12">
        <div className="w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <h2 className="text-xl font-bold text-slate-950">Enhance Your Analysis</h2>
          <p className="mt-2 text-sm text-slate-500">
            LinkedIn's public view returned limited data for{' '}
            <span className="font-semibold text-slate-700">{scrapeData.profile.fullName}</span>.
            Paste your profile details below for real, personalized recommendations.
          </p>

          {scrapeData.profile.title && (
            <div className="mt-4 rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm text-slate-700">
              <span className="font-medium">Detected headline: </span>
              {scrapeData.profile.title}
            </div>
          )}

          <form onSubmit={handleEnrichSubmit} className="mt-6 space-y-5">
            <div>
              <label className="block text-sm font-semibold text-slate-950" htmlFor="about">
                About / Summary
              </label>
              <p className="mt-1 text-xs text-slate-400">
                Copy from your LinkedIn profile → About section
              </p>
              <textarea
                id="about"
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                rows={5}
                placeholder="Paste your LinkedIn About section here…"
                value={aboutText}
                onChange={(e) => setAboutText(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-950" htmlFor="skills">
                Skills
              </label>
              <p className="mt-1 text-xs text-slate-400">
                Comma-separated list, e.g. React, Node.js, TypeScript, AWS
              </p>
              <input
                id="skills"
                type="text"
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="React, Node.js, TypeScript, PostgreSQL…"
                value={skillsText}
                onChange={(e) => setSkillsText(e.target.value)}
              />
            </div>

            {enrichError && (
              <p className="text-sm text-red-600">{enrichError}</p>
            )}

            <div className="flex flex-col gap-3 pt-2 sm:flex-row">
              <button
                type="submit"
                disabled={enrichLoading || (!aboutText.trim() && !skillsText.trim())}
                className="flex-1 rounded-xl bg-slate-950 px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {enrichLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" /> Analyzing…
                  </span>
                ) : (
                  'Run Full Analysis'
                )}
              </button>
              <button
                type="button"
                onClick={handleSkip}
                className="rounded-xl border border-slate-200 px-6 py-3 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50"
              >
                Skip — Quick Analysis
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  if (step === 'error' || !scrapeData?.analysis) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-50 p-8 text-center text-slate-950">
        <h5 className="mb-4 text-2xl font-bold">Analysis failed</h5>
        <p className="mb-8 max-w-md text-red-600">
          {error || 'The AI engine encountered a timeout. Please verify your profile visibility.'}
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

  return <LinkedInAnalysisDashboard analysis={scrapeData.analysis} profile={scrapeData.profile} />;
}
