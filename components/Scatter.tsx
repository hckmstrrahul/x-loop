export function Scatter({ points }: { points: Array<{ quality: number; slop: number }> }) {
  const W = 800;
  const H = 360;
  const PADL = 56;
  const PADR = 24;
  const PADT = 16;
  const PADB = 40;
  const xToPx = (x: number) => PADL + x * (W - PADL - PADR);
  const yToPx = (y: number) => H - PADB - y * (H - PADT - PADB);

  return (
    <svg className="block h-[360px] w-full" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none">
      {/* axes */}
      <line x1={PADL} y1={H - PADB} x2={W - PADR} y2={H - PADB} stroke="rgba(15,14,11,0.18)" />
      <line x1={PADL} y1={PADT} x2={PADL} y2={H - PADB} stroke="rgba(15,14,11,0.18)" />

      {/* 0.40 quality threshold */}
      <line
        x1={PADL}
        y1={yToPx(0.4)}
        x2={W - PADR}
        y2={yToPx(0.4)}
        stroke="var(--color-ink-mute)"
        strokeDasharray="4 6"
      />
      <text
        x={W - PADR - 4}
        y={yToPx(0.4) - 6}
        textAnchor="end"
        fill="var(--color-ink-mute)"
        fontFamily="var(--font-mono)"
        fontSize="10"
        letterSpacing="1.5"
      >
        banger · 0.40 →
      </text>

      {/* 0.30 slop vertical */}
      <line
        x1={xToPx(0.3)}
        y1={PADT}
        x2={xToPx(0.3)}
        y2={H - PADB}
        stroke="var(--color-ink-faint)"
        strokeDasharray="2 4"
      />
      <text
        x={xToPx(0.3) + 6}
        y={PADT + 12}
        fill="var(--color-ink-faint)"
        fontFamily="var(--font-mono)"
        fontSize="9"
        letterSpacing="1"
      >
        slop · 0.30 ↑
      </text>

      {/* axis labels */}
      <text
        x={(PADL + W - PADR) / 2}
        y={H - 10}
        textAnchor="middle"
        fill="var(--color-ink-mute)"
        fontFamily="var(--font-mono)"
        fontSize="10"
        letterSpacing="2"
      >
        SLOP →
      </text>
      <text
        x={16}
        y={(PADT + H - PADB) / 2}
        textAnchor="middle"
        fill="var(--color-ink-mute)"
        fontFamily="var(--font-mono)"
        fontSize="10"
        letterSpacing="2"
        transform={`rotate(-90, 16, ${(PADT + H - PADB) / 2})`}
      >
        QUALITY →
      </text>

      {/* points */}
      {points.map((p, i) => {
        let color = 'var(--color-bad)';
        if (p.quality >= 0.4 && p.slop <= 0.3) color = 'var(--color-good)';
        else if (p.quality >= 0.4 || p.slop <= 0.3) color = 'var(--color-warn)';
        return <circle key={i} cx={xToPx(p.slop)} cy={yToPx(p.quality)} r="3.6" fill={color} opacity="0.78" />;
      })}
    </svg>
  );
}
