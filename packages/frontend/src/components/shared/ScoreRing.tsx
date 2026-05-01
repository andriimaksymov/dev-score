import { cn } from '@/lib/utils';

interface ScoreRingProps {
  score: number;
  label: string;
  color?: string;
  size?: 'sm' | 'md' | 'lg';
}

const sizeMap = {
  sm: { box: 96, radius: 38, stroke: 7, text: 'text-2xl' },
  md: { box: 128, radius: 52, stroke: 8, text: 'text-4xl' },
  lg: { box: 148, radius: 60, stroke: 9, text: 'text-5xl' },
};

export function ScoreRing({ score, label, color = '#7c3aed', size = 'md' }: ScoreRingProps) {
  const normalizedScore = Math.max(0, Math.min(100, Math.round(score || 0)));
  const config = sizeMap[size];
  const center = config.box / 2;
  const circumference = 2 * Math.PI * config.radius;
  const offset = circumference - (normalizedScore / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <div className="relative" style={{ width: config.box, height: config.box }}>
        <svg className="-rotate-90" width={config.box} height={config.box} viewBox={`0 0 ${config.box} ${config.box}`}>
          <circle
            cx={center}
            cy={center}
            r={config.radius}
            fill="none"
            stroke="#f3f4f6"
            strokeWidth={config.stroke}
          />
          <circle
            cx={center}
            cy={center}
            r={config.radius}
            fill="none"
            stroke={color}
            strokeLinecap="round"
            strokeWidth={config.stroke}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={cn('font-bold tracking-tight text-slate-950', config.text)}>{normalizedScore}</span>
        </div>
      </div>
      <span className="text-sm font-medium text-slate-500">{label}</span>
    </div>
  );
}
