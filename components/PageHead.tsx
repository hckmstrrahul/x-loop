export function PageHead({
  eyebrow,
  title,
  highlight,
  sub,
}: {
  eyebrow: string;
  title: string;
  highlight: string;
  sub: string;
}) {
  return (
    <header className="mb-8 grid items-end gap-8 border-b border-rule pb-6 md:grid-cols-[1fr_auto]">
      <div>
        <div className="mb-3 font-mono text-[10px] uppercase tracking-[0.22em] text-bad">
          {eyebrow}
        </div>
        <h1 className="text-5xl font-medium leading-none tracking-tight text-ink">
          {title} <span className="text-ink-mute">·</span>{' '}
          <span className="font-light text-ink-2">{highlight}</span>
        </h1>
      </div>
      <p className="max-w-[440px] text-[15px] leading-snug text-ink-mute md:text-right">{sub}</p>
    </header>
  );
}
