import { BrainCircuit, Server, ArrowRight, Github, Code2, Sparkles } from 'lucide-react';

export const ApiDocs = () => {
  return (
    <section id="api" className="max-w-7xl mx-auto px-6 py-32">
      <div className="grid md:grid-cols-2 gap-16 items-center">
        <div className="order-2 md:order-1 relative">
          <div className="p-8 bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl relative overflow-hidden">
            <div className="absolute inset-0 bg-grid-pattern opacity-5" />

            <div className="relative space-y-12">
              {/* Node 1: GitHub */}
              <div className="flex items-center gap-4">
                <div className="p-3 bg-indigo-500/10 rounded-xl border border-indigo-500/20">
                  <Github className="text-indigo-400 w-6 h-6" />
                </div>
                <div className="flex-1">
                  <div className="text-[10px] font-black text-indigo-400 uppercase tracking-widest leading-none mb-1">
                    Source Data
                  </div>
                  <div className="text-sm font-bold text-white">GitHub API / Octokit</div>
                </div>
                <ArrowRight className="text-slate-700 w-5 h-5 -rotate-90 md:rotate-0" />
              </div>

              {/* Node 2: NestJS */}
              <div className="flex items-center gap-4 ml-8 md:ml-16">
                <div className="p-3 bg-blue-500/10 rounded-xl border border-blue-500/20">
                  <Server className="text-blue-400 w-6 h-6" />
                </div>
                <div className="flex-1">
                  <div className="text-[10px] font-black text-blue-400 uppercase tracking-widest leading-none mb-1">
                    Logic Layer
                  </div>
                  <div className="text-sm font-bold text-white">NestJS Backend Core</div>
                </div>
                <ArrowRight className="text-slate-700 w-5 h-5 -rotate-90 md:rotate-0" />
              </div>

              {/* Node 3: AI Inference */}
              <div className="flex items-center gap-4 ml-16 md:ml-32">
                <div className="p-3 bg-purple-500/10 rounded-xl border border-purple-500/20">
                  <BrainCircuit className="text-purple-400 w-6 h-6" />
                </div>
                <div className="flex-1">
                  <div className="text-[10px] font-black text-purple-400 uppercase tracking-widest leading-none mb-1">
                    Analysis Engine
                  </div>
                  <div className="text-sm font-bold text-white">Gemini 2.5 Pro</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="order-1 md:order-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-[10px] font-bold text-slate-400 mb-6 uppercase tracking-widest">
            Technical Architecture
          </div>
          <h2 className="text-4xl md:text-5xl font-black mb-8 tracking-tighter text-white leading-tight">
            Streamlined <br /> Data Pipeline.
          </h2>
          <p className="text-slate-500 mb-10 leading-relaxed text-lg">
            I built this project with a focused, high-performance stack that prioritizes speed and
            security. The architecture follows a clean horizontal flow from raw data ingestion to
            AI-powered insights.
          </p>

          <div className="grid sm:grid-cols-2 gap-6">
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
              <div className="flex items-center gap-2 mb-2">
                <Code2 size={14} className="text-indigo-500" />
                <span className="text-[10px] font-black text-white uppercase tracking-widest">
                  TypeScript-First
                </span>
              </div>
              <p className="text-[11px] text-slate-500 leading-normal">
                End-to-end type safety between the NestJS backend and React frontend for reliable
                data handling.
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles size={14} className="text-purple-500" />
                <span className="text-[10px] font-black text-white uppercase tracking-widest">
                  AI Synthesis
                </span>
              </div>
              <p className="text-[11px] text-slate-500 leading-normal">
                Context-aware prompt engineering maps low-level activity patterns into high-level
                technical summaries.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
