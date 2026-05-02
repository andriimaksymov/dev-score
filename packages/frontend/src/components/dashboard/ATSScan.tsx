import { Sparkles, AlertCircle, BrainCircuit, Layers } from 'lucide-react';

export const ATSScan = () => {
  const score = 88;
  const improvements = [
    {
      category: 'Impact Factor',
      suggestion: 'Quantify achievements with metrics.',
      quote: 'Developed new features for the platform.',
      rewritten: 'Engineered high-throughput features, increasing system capacity by 45%.',
    },
    {
      category: 'Technical Clarity',
      suggestion: 'Be specific about tool versions.',
      quote: 'Used Docker for deployment.',
      rewritten: 'Orchestrated multi-stage Docker builds reducing image size by 60%.',
    },
  ];

  return (
    <div className="space-y-12 animate-fade-in">
      {/* Header Section Mock */}
      <div className="relative p-8 rounded-[3.5rem] bg-slate-900 border border-slate-800 shadow-3xl overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-600/5 blur-[80px] rounded-full" />
        <div className="relative flex flex-col md:flex-row items-center gap-8">
          <div className="relative w-32 h-32 flex-shrink-0">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="64"
                cy="64"
                r="60"
                stroke="currentColor"
                strokeWidth="8"
                fill="transparent"
                className="text-slate-800"
              />
              <circle
                cx="64"
                cy="64"
                r="60"
                stroke="currentColor"
                strokeWidth="8"
                fill="transparent"
                strokeDasharray="377"
                strokeDashoffset={377 - (377 * score) / 100}
                className="text-purple-500"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-black text-white">{score}</span>
              <span className="text-[8px] font-black uppercase text-slate-500 tracking-tighter">
                Match
              </span>
            </div>
          </div>
          <div className="text-center md:text-left">
            <h1 className="text-3xl font-black text-white tracking-tight mb-2">
              CV Compatibility Audit
            </h1>
            <p className="text-slate-500 font-mono text-[10px] tracking-widest uppercase flex items-center gap-2">
              <Layers size={14} className="text-purple-400" /> RESUME_FINAL.PDF{' '}
              <span className="text-slate-800">|</span>{' '}
              <span className="text-emerald-500">PARSING_SUCCESS</span>
            </p>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-12 gap-8">
        <div className="md:col-span-8 space-y-8">
          {/* Executive Summary */}
          <div className="p-8 rounded-[2.5rem] bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5">
              <BrainCircuit size={120} />
            </div>
            <div className="flex items-center gap-3 mb-6">
              <Sparkles className="text-purple-400" size={20} />
              <h3 className="text-lg font-black uppercase tracking-widest text-white">
                AI Content Critique
              </h3>
            </div>
            <p className="text-slate-300 leading-relaxed text-lg italic">
              "Technically robust but structurally generic. The 'Experience' section lacks the
              high-impact verbs necessary to trigger Staff-level ATS filters."
            </p>
          </div>

          {/* Improvements */}
          <div className="space-y-6">
            {improvements.map((imp, i) => (
              <div
                key={i}
                className="p-4 md:p-8 rounded-[1.5rem] bg-slate-900 border border-slate-800 group hover:border-purple-500/30 transition-all"
              >
                <div className="flex justify-between items-start mb-4">
                  <span className="px-3 py-1 bg-purple-500/10 border border-purple-500/20 rounded-full text-[10px] font-black text-purple-400 uppercase tracking-widest">
                    {imp.category}
                  </span>
                  <AlertCircle size={16} className="text-slate-700" />
                </div>
                <p className="text-sm text-slate-500 italic mb-6">"{imp.suggestion}"</p>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
                    <div className="text-[10px] font-black text-slate-600 uppercase mb-2">
                      Current
                    </div>
                    <p className="text-xs text-slate-400 font-mono">"{imp.quote}"</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/20">
                    <div className="text-[10px] font-black text-emerald-500 uppercase mb-2">
                      Suggested Rewrite
                    </div>
                    <p className="text-xs text-slate-200 font-medium">"{imp.rewritten}"</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar */}
        <div className="md:col-span-4 space-y-8">
          <div className="p-8 rounded-[2rem] bg-slate-900 border border-slate-800 shadow-xl">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-8 flex items-center gap-2 font-mono">
              Keyword Density Gap
            </h4>
            <div className="flex flex-wrap gap-2">
              {['Kubernetes', 'gRPC', 'Infrastructure as Code', 'OAuth2'].map((kw) => (
                <div
                  key={kw}
                  className="px-3 py-1 bg-rose-500/5 border border-rose-500/10 rounded-lg flex items-center gap-2"
                >
                  <div className="w-1 h-1 rounded-full bg-rose-500 opacity-50" />
                  <span className="text-[11px] font-bold text-slate-400">{kw}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
