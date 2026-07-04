import { StrictMode } from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { http, HttpResponse } from 'msw';
import { server } from '@/test/server';
import AnalysisResultsPage from '../AnalysisResultsPage';
import type { AnalysisResult } from '@/features/analysis/types/analysis.types';

const analysisFixture: AnalysisResult = {
  username: 'octocat',
  profile: {
    avatarUrl: '',
    bio: 'Test bio',
    followers: 12,
    company: null,
    location: 'San Francisco',
    publicRepos: 4,
  },
  overallScore: 68,
  scores: { activity: 60, projectQuality: 75, techStackDiversity: 40, consistency: 71 },
  aiInsights: undefined,
  strengths: ['Well-documented projects'],
  weaknesses: ['Limited technology diversity'],
  recommendations: ['Explore different technologies to diversify your skill set'],
  analyzedAt: '2026-07-01T00:00:00.000Z',
};

const renderPage = (username = 'octocat') =>
  render(
    <StrictMode>
      <QueryClientProvider
        client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}
      >
        <MemoryRouter initialEntries={[`/analysis/${username}`]}>
          <Routes>
            <Route path="/analysis/:username" element={<AnalysisResultsPage />} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    </StrictMode>
  );

describe('AnalysisResultsPage', () => {
  it('fetches exactly once (StrictMode-safe) and renders the dashboard', async () => {
    let requestCount = 0;
    server.use(
      http.post('/api/analysis/analyze', () => {
        requestCount += 1;
        return HttpResponse.json(analysisFixture);
      })
    );

    renderPage();

    expect(await screen.findByText('octocat')).toBeInTheDocument();
    expect(screen.getByText('Developer Profile Assessment')).toBeInTheDocument();
    // useQuery dedupes the StrictMode double-mount; a mount-effect mutation
    // would have fired twice.
    expect(requestCount).toBe(1);
  });

  it('shows the error state with the backend message on failure', async () => {
    server.use(
      http.post('/api/analysis/analyze', () =>
        HttpResponse.json({ message: "GitHub user 'ghost' not found" }, { status: 404 })
      )
    );

    renderPage('ghost');

    expect(await screen.findByText('Analysis Failed')).toBeInTheDocument();
    expect(screen.getByText("GitHub user 'ghost' not found")).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Try Again/i })).toBeInTheDocument();
  });
});
