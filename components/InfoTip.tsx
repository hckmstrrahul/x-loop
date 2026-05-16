// CSS-only info tooltip. Renders a small ⓘ glyph; hover or focus reveals
// a panel with the explanation. No JS state — keep it light.

export function InfoTip({ children, label }: { children: React.ReactNode; label?: string }) {
  return (
    <span className="relative inline-flex group align-middle">
      <button
        type="button"
        aria-label={label ?? 'More info'}
        className="ml-1 inline-flex size-3.5 cursor-help items-center justify-center rounded-full border border-ink-faint text-[8px] font-medium leading-none text-ink-mute transition hover:border-ink hover:text-ink focus:outline-none focus:ring-1 focus:ring-ink"
      >
        i
      </button>
      <span
        role="tooltip"
        className="pointer-events-none absolute bottom-full left-1/2 z-30 mb-2 w-64 -translate-x-1/2 rounded-md border border-ink/15 bg-ink px-3 py-2 text-[11.5px] font-normal normal-case leading-relaxed tracking-normal text-paper opacity-0 shadow-lg transition-opacity duration-150 group-hover:opacity-100 group-focus-within:opacity-100"
      >
        {children}
      </span>
    </span>
  );
}
