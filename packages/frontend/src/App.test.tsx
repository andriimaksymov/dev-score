import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from './App';

describe('App', () => {
  it('renders without crashing', async () => {
    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>
    );
    // Pages are lazy-loaded, so await the Hero title past the Suspense fallback.
    expect(await screen.findByText(/Complete Developer Profile Analysis/i)).toBeInTheDocument();
  });
});
