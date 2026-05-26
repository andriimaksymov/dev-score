import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import GitHubAnalysisDashboard from '../GitHubAnalysisDashboard';
import type { ComponentProps } from 'react';
import type { AnalysisResult } from '../../types/analysis.types';

const analysis: AnalysisResult = {
  username: 'octocat',
  profile: {
    avatarUrl: '',
    bio: null,
    followers: 42,
    company: null,
    location: 'San Francisco',
    publicRepos: 8,
  },
  overallScore: 84,
  scores: {
    activity: 80,
    projectQuality: 86,
    techStackDiversity: 78,
    consistency: 74,
  },
  strengths: ['Strong TypeScript projects'],
  weaknesses: ['Add more documentation'],
  recommendations: ['Improve README files'],
  analyzedAt: '2026-05-26T00:00:00.000Z',
};

const renderDashboard = (props: Partial<ComponentProps<typeof GitHubAnalysisDashboard>> = {}) =>
  render(
    <MemoryRouter>
      <GitHubAnalysisDashboard analysis={analysis} {...props} />
    </MemoryRouter>
  );

describe('GitHubAnalysisDashboard', () => {
  it('rescans the current profile without navigating home', async () => {
    const onRescan = vi.fn();
    const user = userEvent.setup();

    renderDashboard({ onRescan });

    await user.click(screen.getByRole('button', { name: /re-scan/i }));

    expect(onRescan).toHaveBeenCalledTimes(1);
  });

  it('keeps the profile header visible while rescanning', () => {
    renderDashboard({ isRescanning: true });

    expect(screen.getByRole('heading', { name: 'octocat' })).toBeInTheDocument();
    expect(screen.getByText(/Refreshing AI Report/i)).toBeInTheDocument();
    expect(screen.queryByText(/Developer Profile Assessment/i)).not.toBeInTheDocument();
  });
});
