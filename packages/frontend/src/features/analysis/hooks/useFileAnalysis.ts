import { useQuery } from '@tanstack/react-query';
import apiClient from '@/api/client';

/**
 * Shared "analyze this PDF" hook for the two upload flows (CV and LinkedIn).
 * The analysis is derived from the selected file on mount, so it is modeled as
 * a query rather than a mutation: `useQuery` runs on mount, dedupes, caches by
 * file identity, and — crucially — is StrictMode-safe.
 *
 * A `useMutation` fired from a `useEffect` is NOT: StrictMode's mount →
 * unmount → remount runs the effect's cleanup between the two setups, which
 * orphans the in-flight mutation so its result never reaches the component and
 * the UI hangs on its loading state. See `usePendingFile` for the sibling
 * StrictMode pitfall on the file hand-off.
 *
 * Pass `file = null` (e.g. before the user re-uploads) to keep the query idle.
 */
export const useFileAnalysis = <TResponse>(endpoint: string, file: File | null) => {
  return useQuery<TResponse>({
    // File identity keys the cache: re-selecting the same file reuses the
    // result; a different file triggers a fresh analysis.
    queryKey: ['file-analysis', endpoint, file?.name, file?.size, file?.lastModified],
    enabled: file != null,
    // The analysis of a given file never changes, and each run hits paid AI
    // providers, so never refetch automatically and never retry on failure.
    staleTime: Infinity,
    gcTime: Infinity,
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    queryFn: async () => {
      const formData = new FormData();
      // `enabled` guarantees `file` is non-null when the query runs.
      formData.append('file', file as File);
      const response = await apiClient.post<TResponse>(endpoint, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    },
  });
};
