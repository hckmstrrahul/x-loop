export function StatCard({
  label,
  value,
  delta,
  deltaTone = 'good',
}: {
  label: string;
  value: React.ReactNode;
  delta?: string;
  deltaTone?: 'good' | 'bad' | 'mute';
}) {
  const deltaCls =
    deltaTone === 'bad' ? 'text-bad' : deltaTone === 'mute' ? 'text-ink-mute' : 'text-good';
  return (
    <div className="rounded-md border border-rule bg-panel p-5">
      <div className="mb-2 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-mute">
        {label}
      </div>
      <div className="text-[40px] font-light leading-none tracking-tight text-ink tnum">
        {value}
      </div>
      {delta && (
        <div className={`mt-2 font-mono text-[10px] tracking-wider ${deltaCls}`}>{delta}</div>
      )}
    </div>
  );
}
