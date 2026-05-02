import {
  Users,
  TrendingUp,
  Zap,
  ShieldCheck,
  Sparkles,
  Target,
  Briefcase,
  CheckCircle2,
} from 'lucide-react';

export const NetworkMap = () => {
  const stats = [
    {
      label: 'Overall Reach',
      val: '840',
      icon: <TrendingUp className="text-blue-500" />,
      sub: 'Senior/Lead',
    },
    {
      label: 'Profile Strength',
      val: '92',
      icon: <Users className="text-indigo-500" />,
      sub: 'Excellent',
    },
    {
      label: 'Market Visibility',
      val: '78',
      icon: <Zap className="text-amber-500" />,
      sub: 'Strong',
    },
    {
      label: 'Trust Factor',
      val: '85',
      icon: <ShieldCheck className="text-emerald-500" />,
      sub: 'Top 5%',
    },
  ];

  return (
    <div className="space-y-12 animate-fade-in">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div
            key={i}
            className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl group hover:border-blue-500/30 transition-all flex flex-col"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-slate-950 rounded-xl border border-slate-800">{stat.icon}</div>
              <div className="text-[10px] font-black text-slate-600 uppercase tracking-widest">
                Live Analysis
              </div>
            </div>
            <div className="text-3xl font-black text-white mb-1 group-hover:text-blue-400 transition-colors">
              {stat.val}
            </div>
            <div className="text-xs text-slate-500 font-bold mb-4">{stat.label}</div>
            <div className="mt-auto pt-4 border-t border-slate-800/50 text-[10px] text-slate-400 italic">
              {stat.sub}
            </div>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-12 gap-8">
        {/* Main Content */}
        <div className="md:col-span-8 space-y-8">
          {/* Narrative */}
          <div className="p-4 md:p-8 rounded-[1.5rem] bg-gradient-to-br from-blue-900/20 to-slate-950 border border-blue-500/20 shadow-2xl relative">
            <div className="flex items-center gap-3 mb-6">
              <Sparkles className="text-blue-400" size={20} />
              <h3 className="text-lg font-black uppercase tracking-widest text-white">
                Growth Summary
              </h3>
            </div>
            <p className="text-slate-300 leading-relaxed text-lg italic">
              "A highly specialized Platform Lead with a clear emphasis on{' '}
              <span className="text-white font-bold">distributed systems efficiency</span>. The
              profile has reached critical mass in the DevOps sector, with significant organic
              engagement from Staff-level influencers."
            </p>
          </div>

          {/* Optimization Card */}
          <div className="p-4 md:p-8 rounded-[1.5rem] bg-slate-900 border border-slate-800 shadow-xl">
            <h3 className="text-lg font-black uppercase tracking-widest flex items-center gap-3 mb-8">
              <Target size={20} className="text-amber-500" /> AI Optimization Strategy
            </h3>
            <div className="space-y-6">
              <div className="p-5 bg-slate-950 border-l-4 border-blue-500 rounded-r-2xl">
                <div className="text-xs font-black text-blue-400 uppercase mb-2">
                  Headline Suggestion
                </div>
                <p className="text-sm text-slate-300 font-medium">
                  "Principal Distributed Systems Engineer | Built high-throughput WASM runtimes
                  @ScaleAI | 5x OSS Contributor"
                </p>
              </div>
              <div className="p-5 bg-slate-950 border-l-4 border-amber-500 rounded-r-2xl">
                <div className="text-xs font-black text-amber-400 uppercase mb-2">
                  About Section Gap
                </div>
                <p className="text-sm text-slate-300 italic mb-2 font-bold">
                  Missing quantifiable infrastructure metrics.
                </p>
                <p className="text-xs text-slate-500 leading-relaxed font-mono italic">
                  "Rewrite to emphasize the $2M/yr savings achieved through kernel-level resource
                  optimization."
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="md:col-span-4 space-y-8">
          <div className="p-4 md:p-8 rounded-[1.5rem] bg-slate-900 border border-slate-800 shadow-xl">
            <h4 className="text-xs font-black uppercase tracking-widest text-slate-500 mb-8 flex items-center gap-2">
              <Briefcase size={16} /> 60-Day Roadmap
            </h4>
            <div className="space-y-6">
              {[
                'Update headline to reflect WASM expertise',
                'Publish 2 technical posts on memory safety',
                'Request endorsements for "Systems Design"',
              ].map((plan, i) => (
                <div key={i} className="flex gap-4 items-start">
                  <div className="w-5 h-5 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <CheckCircle2 size={12} className="text-blue-500" />
                  </div>
                  <span className="text-xs text-slate-400 leading-relaxed">{plan}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
