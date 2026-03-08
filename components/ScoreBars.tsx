"use client";

function getScoreColor(value: number): string {
  if (value >= 75) return "#10b981";
  if (value >= 50) return "#f59e0b";
  return "#ef4444";
}

function getScoreGradient(value: number): string {
  if (value >= 75) return "linear-gradient(90deg, #10b981, #34d399)";
  if (value >= 50) return "linear-gradient(90deg, #f59e0b, #fbbf24)";
  return "linear-gradient(90deg, #ef4444, #f87171)";
}

export function ScoreBar({ label, value }: { label: string; value: number }) {
  const clampedValue = Math.max(0, Math.min(100, value));
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium text-slate-300">{label}</span>
        <span className="text-sm font-bold" style={{ color: getScoreColor(clampedValue) }}>
          {clampedValue}<span className="text-slate-500 font-normal">/100</span>
        </span>
      </div>
      <div className="h-2.5 w-full rounded-full" style={{ background: "rgba(30, 41, 59, 0.8)" }}>
        <div
          className="h-2.5 rounded-full animate-score-slide"
          style={{
            width: `${clampedValue}%`,
            background: getScoreGradient(clampedValue),
            boxShadow: `0 0 12px ${getScoreColor(clampedValue)}40`,
          }}
        />
      </div>
    </div>
  );
}

export function ScoreCard({ label, value, icon }: { label: string; value: number; icon?: string }) {
  const clampedValue = Math.max(0, Math.min(100, value));
  return (
    <div className="glass-card p-5 text-center animate-fade-in-up">
      {icon && <div className="text-2xl mb-2">{icon}</div>}
      <div className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">{label}</div>
      <div className="text-4xl font-bold" style={{ color: getScoreColor(clampedValue) }}>
        {clampedValue}
      </div>
      <div className="mt-2 h-1.5 w-full rounded-full" style={{ background: "rgba(30, 41, 59, 0.8)" }}>
        <div
          className="h-1.5 rounded-full animate-score-slide"
          style={{
            width: `${clampedValue}%`,
            background: getScoreGradient(clampedValue),
          }}
        />
      </div>
    </div>
  );
}
