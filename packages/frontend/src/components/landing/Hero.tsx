import { useRef } from 'react';
import { ArrowRight, Github, Linkedin, Upload } from 'lucide-react';
import { cn } from '@/lib/utils';

interface HeroProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  inputValue: string;
  setInputValue: (val: string) => void;
  onRunEngine: () => void;
  onFileUpload?: (file: File) => void;
}

const sources = [
  { id: 'github', label: 'GitHub Profile', helper: 'Analyze code contributions', icon: Github },
  { id: 'linkedin', label: 'LinkedIn Profile', helper: 'Upload PDF, get a score', icon: Linkedin },
  { id: 'cv', label: 'Resume / CV', helper: 'Upload PDF for review', icon: Upload },
];

export const Hero = ({
  activeTab,
  setActiveTab,
  inputValue,
  setInputValue,
  onRunEngine,
  onFileUpload,
}: HeroProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSourceSelect = (source: string) => {
    setActiveTab(source);
    setInputValue('');
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && onFileUpload) {
      onFileUpload(file);
    }
  };

  const handleFileDrop = (event: React.DragEvent<HTMLButtonElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files?.[0];
    if (file?.type === 'application/pdf' && onFileUpload) {
      onFileUpload(file);
    }
  };

  return (
    <section id="demo" className="pt-36 pb-16">
      <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
        <h1 className="mx-auto max-w-none bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-5xl font-bold leading-tight tracking-tight text-transparent sm:text-6xl lg:text-[60px]">
          Your Complete Developer Profile Analysis
        </h1>
        <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-slate-500 sm:text-xl">
          Get actionable insights from your GitHub activity, LinkedIn presence, and resume. Identify
          strengths, discover gaps, and accelerate your career growth.
        </p>

        <div className="mx-auto mt-16 max-w-4xl rounded-2xl border border-slate-200 bg-white p-8 text-left shadow-2xl shadow-slate-200/70">
          <h2 className="text-center text-lg font-bold text-slate-950">Choose Analysis Source</h2>

          <div className="mt-7 grid gap-4 md:grid-cols-3">
            {sources.map((source) => {
              const Icon = source.icon;
              const selected = activeTab === source.id;

              return (
                <button
                  className={cn(
                    'rounded-xl border-2 p-6 text-center transition',
                    selected
                      ? 'border-violet-600 bg-violet-50/70'
                      : 'border-slate-200 bg-white hover:border-violet-200 hover:bg-slate-50'
                  )}
                  key={source.id}
                  onClick={() => handleSourceSelect(source.id)}
                  type="button"
                >
                  <Icon
                    className={cn(
                      'mx-auto h-8 w-8',
                      selected ? 'text-violet-600' : 'text-slate-400'
                    )}
                  />
                  <div className="mt-4 font-semibold text-slate-950">{source.label}</div>
                  <div className="mt-2 text-sm font-medium text-slate-500">{source.helper}</div>
                </button>
              );
            })}
          </div>

          <div className="mt-8">
            {activeTab === 'github' ? (
              <>
                <label
                  className="block text-base font-semibold text-slate-950"
                  htmlFor="analysis-input"
                >
                  GitHub Username or Profile URL
                </label>
                <input
                  id="analysis-input"
                  className="mt-3 h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-base text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
                  placeholder="e.g., octocat or https://github.com/octocat"
                  value={inputValue}
                  onChange={(event) => setInputValue(event.target.value)}
                />
              </>
            ) : (
              <>
                <button
                  className="flex w-full flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 px-6 py-9 text-center transition hover:border-violet-300 hover:bg-violet-50/40"
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={handleFileDrop}
                  onClick={() => fileInputRef.current?.click()}
                  type="button"
                >
                  <Upload className="h-8 w-8 text-violet-600" />
                  <span className="mt-4 font-semibold text-slate-950">
                    {inputValue ||
                      (activeTab === 'linkedin' ? 'Upload LinkedIn PDF' : 'Upload Resume (PDF)')}
                  </span>
                  <span className="mt-2 text-sm text-slate-500">
                    Click to upload or drag and drop
                  </span>
                  <span className="mt-1 text-sm text-slate-500">PDF up to 10MB</span>
                  <input
                    ref={fileInputRef}
                    className="hidden"
                    type="file"
                    accept=".pdf"
                    onChange={handleFileChange}
                  />
                </button>

                {activeTab === 'linkedin' && (
                  <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 px-5 py-4">
                    <p className="text-sm font-semibold text-slate-950">
                      How to export your LinkedIn PDF
                    </p>
                    <ol className="mt-2 space-y-1 text-sm text-slate-600">
                      <li>1. Go to your LinkedIn profile page</li>
                      <li>2. Click &quot;More&quot; below your headline</li>
                      <li>3. Select &quot;Save to PDF&quot;</li>
                    </ol>
                  </div>
                )}
              </>
            )}
          </div>

          <button
            className={cn(
              'mt-6 flex h-14 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-400 to-fuchsia-400 font-bold text-white transition',
              inputValue
                ? 'hover:from-violet-500 hover:to-fuchsia-500'
                : 'cursor-not-allowed opacity-70'
            )}
            disabled={!inputValue}
            onClick={onRunEngine}
            type="button"
          >
            Analyze Profile
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </section>
  );
};
