import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';
import CvAnalysisDashboard from '../CvAnalysisDashboard';
import type { CvAnalysisResult } from '@/features/analysis/types/analysis.types';

// Stub the heavy lazy PDF reviewer so tests can assert which right-pane state
// it receives without loading pdf.js in jsdom.
vi.mock('@/features/analysis/components/CvPdfReviewer', () => ({
  default: ({ rightPane = 'live' }: { rightPane?: string }) => (
    <div data-testid="cv-reviewer">reviewer:{rightPane}</div>
  ),
}));

const emptyAnalysis: CvAnalysisResult = {
  summary: { critique: 'Readable but sparse resume.', professionalLikelihood: 42 },
  improvements: [],
  missingKeywords: [],
};

const pdfFile = () => new File(['%PDF-1.4 test'], 'resume.pdf', { type: 'application/pdf' });

const renderDashboard = (analysis: CvAnalysisResult, text = '') =>
  render(
    <MemoryRouter>
      <CvAnalysisDashboard analysis={analysis} text={text} fileName="resume.pdf" />
    </MemoryRouter>
  );

/**
 * Regression lock for the fabricated-data purge: with an empty API response
 * the dashboard must show honest empty states — never invented projects,
 * checklists, percentages, or impact claims.
 */
describe('CvAnalysisDashboard (empty API response)', () => {
  it('renders explicit empty states instead of fabricated content', () => {
    renderDashboard(emptyAnalysis);

    expect(screen.getByText(/No readable text could be extracted/i)).toBeInTheDocument();
    expect(screen.getByText(/No missing keywords were detected/i)).toBeInTheDocument();
    expect(screen.getByText(/No follow-up actions were generated/i)).toBeInTheDocument();
    expect(screen.getByText(/No quality signals were collected/i)).toBeInTheDocument();
    expect(screen.getByText(/No priority action was identified/i)).toBeInTheDocument();
  });

  it('never renders the previously hardcoded fake claims', () => {
    renderDashboard(emptyAnalysis);

    // Signature strings from the removed fallback blocks.
    expect(screen.queryByText(/\+40-60% interview rate/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/85-90% ATS pass rate/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/SAMPLE CANDIDATE/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/ATS Compatibility/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Visual Layout/i)).not.toBeInTheDocument();
  });

  it('shows real counts and confidence when data is present', () => {
    renderDashboard(
      {
        ...emptyAnalysis,
        missingKeywords: ['Redis', 'Terraform'],
        analysisMetadata: {
          source: 'cv',
          provider: 'deterministic',
          model: 'deterministic-rules-v2',
          schemaVersion: 'career-analysis-v2',
          confidence: 0.56,
          warnings: [],
          generatedAt: '2026-07-01T00:00:00.000Z',
        },
      },
      ''
    );

    expect(screen.getByText('Redis')).toBeInTheDocument();
    expect(screen.getByText('Terraform')).toBeInTheDocument();
    expect(screen.getByText('56%')).toBeInTheDocument();
    expect(screen.getByText('Provider: deterministic')).toBeInTheDocument();
    expect(screen.getByText('2 missing keywords')).toBeInTheDocument();
  });
});

/**
 * The page + original PDF must render immediately while the analysis is still
 * in flight; only the analysis-dependent content shows skeletons.
 */
describe('CvAnalysisDashboard (progressive loading)', () => {
  it('renders the original PDF pane and skeletons while analyzing', async () => {
    render(
      <MemoryRouter>
        <CvAnalysisDashboard
          analysis={null}
          text=""
          fileName="resume.pdf"
          file={pdfFile()}
          isAnalyzing
        />
      </MemoryRouter>
    );

    // The reviewer (original PDF) renders immediately with a loading right pane.
    expect(await screen.findByTestId('cv-reviewer')).toHaveTextContent('reviewer:loading');
    expect(screen.getByText('Analyzing…')).toBeInTheDocument();
    // Analysis-dependent content is not shown yet.
    expect(screen.queryByText('Executive Summary')).not.toBeInTheDocument();
    expect(screen.queryByText('Missing ATS Keywords')).not.toBeInTheDocument();
  });

  it('shows an error with retry and hides the updated pane on failure', async () => {
    const onRetry = vi.fn();
    render(
      <MemoryRouter>
        <CvAnalysisDashboard
          analysis={null}
          text=""
          fileName="resume.pdf"
          file={pdfFile()}
          analysisError="Only PDF files are supported"
          onRetry={onRetry}
        />
      </MemoryRouter>
    );

    // The original PDF still renders; the updated pane is hidden.
    expect(await screen.findByTestId('cv-reviewer')).toHaveTextContent('reviewer:hidden');
    expect(screen.getByText('Analysis failed')).toBeInTheDocument();
    expect(screen.getByText('Only PDF files are supported')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Try Again/i }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });
});
