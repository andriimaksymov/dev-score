import { useQuery } from '@tanstack/react-query';
import { analyzePortfolio } from '../api/analysisApi';

/**
 * GitHub analysis is a read keyed by username, so it is modeled as a query:
 * results are cached per user, StrictMode double-mounts are deduped, and
 * navigating back to a recent report renders instantly from cache.
 */
export const useAnalyzePortfolio = (username: string | undefined) => {
  return useQuery({
    queryKey: ['analysis', username],
    queryFn: () => analyzePortfolio({ username: username! }),
    enabled: Boolean(username),
    staleTime: 5 * 60 * 1000,
  });
};
