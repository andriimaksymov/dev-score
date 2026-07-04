import { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, FileUp, Loader2 } from 'lucide-react';

/** Full-screen pending state shared by all three analysis flows. */
export const AnalysisPending = ({ title, detail }: { title: string; detail: string }) => (
  <div
    role="status"
    className="flex min-h-screen flex-col items-center justify-center gap-6 bg-slate-50 text-center"
  >
    <Loader2 size={48} className="animate-spin text-violet-600" aria-hidden />
    <h6 className="font-bold text-slate-950">{title}</h6>
    <p className="text-sm text-slate-500">{detail}</p>
  </div>
);

/** Full-screen error state with retry and home actions. */
export const AnalysisError = ({
  title,
  message,
  onRetry,
}: {
  title: string;
  message: string;
  onRetry?: () => void;
}) => {
  const navigate = useNavigate();
  return (
    <div
      role="alert"
      className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-50 p-8 text-center text-slate-950"
    >
      <h5 className="text-2xl font-bold">{title}</h5>
      <p className="max-w-md text-red-600">{message}</p>
      <div className="mt-4 flex items-center gap-3">
        {onRetry && (
          <button
            onClick={onRetry}
            className="rounded-xl bg-violet-600 px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-violet-700"
          >
            Try Again
          </button>
        )}
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 rounded-xl bg-slate-950 px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-slate-800"
        >
          <ArrowLeft size={18} aria-hidden /> Return Home
        </button>
      </div>
    </div>
  );
};

/**
 * Shown when an upload flow is opened without a file (deep link or refresh).
 * Offers a re-upload right here instead of silently bouncing the user home.
 */
export const ReuploadPrompt = ({
  title,
  detail,
  onFile,
}: {
  title: string;
  detail: string;
  onFile: (file: File) => void;
}) => {
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-50 p-8 text-center text-slate-950">
      <h5 className="text-2xl font-bold">{title}</h5>
      <p className="max-w-md text-slate-500">{detail}</p>
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf"
        className="sr-only"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) onFile(file);
        }}
      />
      <div className="mt-4 flex items-center gap-3">
        <button
          onClick={() => inputRef.current?.click()}
          className="flex items-center gap-2 rounded-xl bg-violet-600 px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-violet-700"
        >
          <FileUp size={18} aria-hidden /> Upload PDF
        </button>
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 rounded-xl bg-slate-950 px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-slate-800"
        >
          <ArrowLeft size={18} aria-hidden /> Return Home
        </button>
      </div>
    </div>
  );
};
