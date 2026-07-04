import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Hero } from '../Hero';

describe('Hero Component', () => {
  const defaultProps = {
    activeTab: 'github',
    setActiveTab: vi.fn(),
    inputValue: '',
    setInputValue: vi.fn(),
    onRunEngine: vi.fn(),
    onFileUpload: vi.fn(),
  };

  it('renders the main headline', () => {
    render(
      <MemoryRouter>
        <Hero {...defaultProps} />
      </MemoryRouter>
    );
    expect(screen.getByText(/how strong your developer profile is/i)).toBeInTheDocument();
  });

  it('renders the CTA button', () => {
    render(
      <MemoryRouter>
        <Hero {...defaultProps} inputValue="octocat" />
      </MemoryRouter>
    );
    const ctaButton = screen.getByRole('button', { name: /Analyze profile/i });
    expect(ctaButton).toBeInTheDocument();
  });

  it('renders the source selector', () => {
    render(
      <MemoryRouter>
        <Hero {...defaultProps} />
      </MemoryRouter>
    );
    expect(screen.getByRole('button', { name: /GitHub/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /LinkedIn/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Resume/i })).toBeInTheDocument();
  });
});
