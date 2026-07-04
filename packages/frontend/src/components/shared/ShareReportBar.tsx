import { useEffect, useState } from 'react';
import { Check, Link2 } from 'lucide-react';

/**
 * Slim banner offering a copyable share link for a persisted report.
 * Renders nothing when the server did not persist the analysis (history
 * not configured), so the feature degrades invisibly.
 */
export const ShareReportBar = ({ reportId }: { reportId?: string | null }) => {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(timer);
  }, [copied]);

  if (!reportId) return null;

  const shareUrl = `${window.location.origin}/report/${reportId}`;

  return (
    <div className="border-b border-violet-100 bg-violet-50">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-2.5 sm:px-6 lg:px-8">
        <p className="text-sm text-violet-900">
          This report is saved — anyone with the link can view it.
        </p>
        <button
          className="inline-flex items-center gap-2 rounded-lg bg-violet-600 px-3 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-violet-700"
          onClick={() => {
            void navigator.clipboard.writeText(shareUrl).then(() => setCopied(true));
          }}
          type="button"
        >
          {copied ? <Check size={14} aria-hidden /> : <Link2 size={14} aria-hidden />}
          {copied ? 'Copied!' : 'Copy share link'}
        </button>
      </div>
    </div>
  );
};
