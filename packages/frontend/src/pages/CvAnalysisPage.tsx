import CvAnalysisDashboard from '../features/analysis/components/CvAnalysisDashboard';
import { useFileAnalysis } from '@/features/analysis/hooks/useFileAnalysis';
import { usePendingFile } from '@/features/analysis/hooks/usePendingFile';
import { ReuploadPrompt } from '@/components/shared/AnalysisStatus';
import { ShareReportBar } from '@/components/shared/ShareReportBar';
import type { CvUploadResponse } from '@/features/analysis/types/analysis.types';

export default function CvAnalysisPage() {
  const [file, setFile] = usePendingFile();
  const { data, isError, error, refetch } = useFileAnalysis<CvUploadResponse>('/cv/upload', file);

  if (!file) {
    return (
      <ReuploadPrompt
        title="Upload your resume"
        detail="Your file is no longer available (files do not survive a page refresh). Upload the PDF again to run the analysis."
        onFile={setFile}
      />
    );
  }

  // Render the page and the original PDF immediately from the in-memory file;
  // only the analysis-dependent content waits on the server.
  const isAnalyzing = !data && !isError;
  const analysisError = isError
    ? error instanceof Error
      ? error.message
      : 'Failed to analyze CV.'
    : null;

  return (
    <>
      <ShareReportBar reportId={data?.reportId} />
      <CvAnalysisDashboard
        analysis={data?.analysis ?? null}
        text={data?.fullText ?? ''}
        fileName={file.name}
        file={file}
        isAnalyzing={isAnalyzing}
        analysisError={analysisError}
        onRetry={() => refetch()}
      />
    </>
  );
}
