import { Trophy, TrendingUp, Zap, Briefcase, Sparkles, Code } from 'lucide-react';

export const RepoAudit = () => {
  const stats = [
    {
      label: 'Authority Score',
      val: '94',
      icon: <Trophy className="text-amber-500" />,
      sub: 'Top 6% Globally',
    },
    {
      label: 'Code Velocity',
      val: 'High',
      icon: <TrendingUp className="text-emerald-500" />,
      sub: '42 Public Repos',
    },
    {
      label: 'Total Impact',
      val: '1.2k',
      icon: <Zap className="text-blue-500" />,
      sub: 'Followers & Reach',
    },
    {
      label: 'Consistency',
      val: '92%',
      icon: <Briefcase className="text-purple-500" />,
      sub: 'Commit Frequency',
    },
  ];

  return (
    <div className="space-y-12 animate-fade-in">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div
            key={i}
            className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl group hover:border-indigo-500/30 transition-all"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-slate-950 rounded-xl border border-slate-800">{stat.icon}</div>
              <div className="text-[10px] font-black text-slate-600 uppercase tracking-widest">
                Live Analysis
              </div>
            </div>
            <div className="text-3xl font-black text-white mb-1 group-hover:text-indigo-400 transition-colors">
              {stat.val}
            </div>
            <div className="text-xs text-slate-500 font-bold">{stat.label}</div>
            <div className="mt-4 pt-4 border-t border-slate-800/50 text-[10px] text-slate-400 italic">
              {stat.sub}
            </div>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-12 gap-8">
        {/* Main Content */}
        <div className="md:col-span-8 space-y-8">
          {/* Executive Summary */}
          <div className="p-4 md:p-8 rounded-[1.5rem] bg-gradient-to-br from-indigo-900/20 to-slate-950 border border-indigo-500/20 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5">
              <Sparkles size={120} />
            </div>
            <div className="flex items-center gap-3 mb-6">
              <Sparkles className="text-indigo-400" size={20} />
              <h3 className="text-lg font-black uppercase tracking-widest text-white">
                Technical Summary
              </h3>
            </div>
            <p className="text-slate-300 leading-relaxed text-lg italic">
              "A highly proficient full-stack developer with a distinct focus on{' '}
              <span className="text-white font-bold">WASM-based systems</span>. The portfolio
              demonstrates strong architectural consistency and a rare ability to bridge the gap
              between low-level performance and elegant frontend abstractions."
            </p>
          </div>

          {/* Flagship Projects */}
          <div className="p-4 md:p-8 rounded-[1.5rem] bg-slate-900 border border-slate-800 shadow-xl">
            <div className="flex justify-between items-center mb-10">
              <h3 className="text-lg font-black uppercase tracking-widest flex items-center gap-3">
                <Code size={20} className="text-slate-500" /> Flagship Repositories
              </h3>
            </div>
            <div className="space-y-6">
              {[
                {
                  name: 'nebula-engine',
                  reason: 'High-performance WASM runtime with 400+ stars',
                  stars: 412,
                  techs: ['Rust', 'WASM', 'TypeScript'],
                },
                {
                  name: 'react-gl-composer',
                  reason: 'Industry-standard WebGL abstraction for React',
                  stars: 285,
                  techs: ['React', 'WebGL', 'GLSL'],
                },
              ].map((project, i) => (
                <div
                  key={i}
                  className="p-6 border border-slate-800/50 rounded-2xl bg-slate-950/30 flex flex-col gap-3 group hover:border-indigo-500/30 transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="text-lg font-black text-white group-hover:text-indigo-400 transition-colors">
                        {project.name}
                      </div>
                      <p className="text-sm text-slate-500 italic mt-1">{project.reason}</p>
                    </div>
                    <div className="flex whitespace-nowrap items-center gap-1.5 px-3 py-1 bg-slate-900 rounded-full border border-slate-800 text-[10px] font-bold text-slate-400">
                      {project.stars} Stars
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {project.techs.map((tech) => (
                      <span key={tech} className="text-[10px] font-mono text-slate-400">
                        #{tech}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="md:col-span-4 space-y-8">
          <div className="p-4 md:p-8 rounded-[1.5rem] bg-slate-900 border border-slate-800 shadow-xl">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-6 flex items-center gap-2">
              <TrendingUp size={14} /> Career Trajectory
            </h4>
            <div className="space-y-4">
              <p className="text-sm text-slate-300">
                Best suited for{' '}
                <span className="text-white font-bold">Staff Software Engineer</span> or{' '}
                <span className="text-white font-bold">Systems Architect</span> roles in
                heavy-compute sectors.
              </p>
            </div>
          </div>

          <div className="p-4 md:p-8 rounded-[1.5rem] bg-indigo-600/5 border border-indigo-500/20 relative overflow-hidden">
            <div className="flex justify-between items-center mb-6">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-indigo-400 font-mono">
                Core Strengths
              </h4>
            </div>
            <div className="space-y-3">
              {['High-Performance WASM', 'Systems Reliability', 'GPU Accelerated UI'].map(
                (strength, i) => (
                  <div key={i} className="flex items-center gap-3 text-sm text-slate-400">
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                    {strength}
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
