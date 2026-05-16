export function Gauge({
  label,
  value,
  tone = 'good',
  threshold,
}: {
  label: string;
  value: number;
  tone?: 'good' | 'warn' | 'bad';
  threshold?: number;
}) {
  const pct = Math.max(0, Math.min(1, value)) * 100;
  const toneClass =
    tone === 'bad' ? 'bg-bad' : tone === 'warn' ? 'bg-warn' : 'bg-good';
  return (
    <div className="grid grid-cols-[110px_1fr_64px] items-center gap-3.5 border-b border-dashed border-rule py-2.5 last:border-b-0">
      <div className="font-mono text-[11px] uppercase tracking-wider text-ink-mute">{label}</div>
      <div className="relative h-1.5 rounded-sm bg-paper-2">
        <div
          className={`absolute inset-y-0 left-0 rounded-sm transition-[width] duration-500 ease-out ${toneClass}`}
          style={{ width: `${pct}%` }}
        />
        {typeof threshold === 'number' && (
          <div
            className="absolute -top-1 -bottom-1 w-px bg-ink-mute"
            style={{ left: `${threshold * 100}%` }}
          >
            <span className="absolute -bottom-4 -left-2.5 font-mono text-[8px] tracking-wider text-ink-mute">
              {threshold.toFixed(2)}
            </span>
          </div>
        )}
      </div>
      <div className="text-right font-mono text-[13px] font-medium text-ink tnum">
        {value.toFixed(2)}
      </div>
    </div>
  );
}
