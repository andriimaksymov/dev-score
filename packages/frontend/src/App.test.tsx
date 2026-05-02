import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from './App';

describe('App', () => {
  it('renders without crashing', () => {
    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>
    );
    // Expect the Hero section title to be present as a basic smoke test
    expect(screen.getByText(/Complete Developer Profile Analysis/i)).toBeInTheDocument();
  });
});
