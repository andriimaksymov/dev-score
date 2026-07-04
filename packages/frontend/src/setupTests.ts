import '@testing-library/jest-dom';
import { server } from './test/server';

// MSW: fail loudly on unhandled requests so tests can't silently hit nothing.
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
