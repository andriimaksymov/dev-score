import { setupServer } from 'msw/node';

/**
 * Shared MSW server for unit/integration tests. Handlers are registered
 * per-test with `server.use(...)` so each test states its own contract.
 */
export const server = setupServer();
