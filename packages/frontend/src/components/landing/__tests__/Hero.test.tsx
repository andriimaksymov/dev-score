import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Hero } from '../Hero';

describe('Hero Component', () => {
  const defaultProps = {
    activeTab: 'github',
    setActiveTab: vi.fn(),
    inputValue: '',
    setInputValue: vi.fn(),
    isAnalyzing: false,
    loadingStep: 0,
    onRunEngine: vi.fn(),
    onFileUpload: vi.fn(),
  };

  it('renders the main headline', () => {
    render(
      <MemoryRouter>
        <Hero {...defaultProps} />
      </MemoryRouter>
    );
    expect(screen.getByText(/Complete Developer Profile Analysis/i)).toBeInTheDocument();
  });

  it('renders the CTA button', () => {
    render(
      <MemoryRouter>
        <Hero {...defaultProps} />
      </MemoryRouter>
    );
    const ctaButton = screen.getByRole('button', { name: /Analyze Profile/i });
    expect(ctaButton).toBeInTheDocument();
  });

  it('displays the trusted by badge', () => {
    render(
      <MemoryRouter>
        <Hero {...defaultProps} />
      </MemoryRouter>
    );
    expect(screen.getByText(/Choose Analysis Source/i)).toBeInTheDocument();
  });
});
