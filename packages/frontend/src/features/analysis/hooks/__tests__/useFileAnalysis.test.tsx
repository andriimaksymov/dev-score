import type { ReactNode } from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { http, HttpResponse } from 'msw';
import { server } from '@/test/server';
import { useFileAnalysis } from '../useFileAnalysis';
import { ApiError } from '@/api/client';

const wrapper = ({ children }: { children: ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
};

const pdfFile = () => new File(['%PDF-1.4 test'], 'resume.pdf', { type: 'application/pdf' });

describe('useFileAnalysis', () => {
  it('posts the file as multipart form data and returns the typed response', async () => {
    let receivedContentType: string | null = null;
    server.use(
      http.post('/api/cv/upload', ({ request }) => {
        receivedContentType = request.headers.get('content-type');
        return HttpResponse.json({ fullText: 'extracted', analysis: { ok: true } });
      })
    );

    // The file must be a stable reference: it is part of the query key, so
    // creating a fresh File on each render would thrash the key forever.
    const file = pdfFile();
    const { result } = renderHook(
      () => useFileAnalysis<{ fullText: string; analysis: { ok: boolean } }>('/cv/upload', file),
      { wrapper }
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true), { timeout: 3000 });
    expect(result.current.data?.fullText).toBe('extracted');
    expect(receivedContentType).toContain('multipart/form-data');
  });

  it('stays idle while no file is selected', () => {
    const { result } = renderHook(() => useFileAnalysis('/cv/upload', null), { wrapper });

    // A disabled query never fetches; it reports no data and no error.
    expect(result.current.fetchStatus).toBe('idle');
    expect(result.current.data).toBeUndefined();
    expect(result.current.isError).toBe(false);
  });

  it('normalizes backend errors into ApiError with the server message', async () => {
    server.use(
      http.post('/api/cv/upload', () =>
        HttpResponse.json({ message: 'Only PDF files are supported' }, { status: 400 })
      )
    );

    const file = pdfFile();
    const { result } = renderHook(() => useFileAnalysis('/cv/upload', file), { wrapper });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeInstanceOf(ApiError);
    expect(result.current.error?.message).toBe('Only PDF files are supported');
    expect((result.current.error as ApiError).status).toBe(400);
  });
});
