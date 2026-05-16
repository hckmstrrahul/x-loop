'use client';

import { PROVIDERS } from '@/lib/providers';
import { useApiKey } from '@/lib/use-api-key';

export function ProviderBadge({ onOpen }: { onOpen: () => void }) {
  const { key, hydrated } = useApiKey();

  if (!hydrated) {
    return (
      <span className="rounded-full border border-rule-strong px-3 py-1 font-mono text-[10px] uppercase tracking-wider text-ink-mute">
        loading…
      </span>
    );
  }

  if (!key) {
    return (
      <button
        onClick={onOpen}
        className="inline-flex items-center gap-2 rounded-full border border-bad bg-bad-soft px-3 py-1 font-mono text-[10px] uppercase tracking-wider text-bad transition hover:bg-bad hover:text-paper"
      >
        <span>set api key</span>
        <span aria-hidden>→</span>
      </button>
    );
  }

  const info = PROVIDERS[key.provider];

  return (
    <button
      onClick={onOpen}
      title="Click to change provider or model"
      className="inline-flex items-center gap-2 rounded-full border border-rule-strong bg-panel px-3 py-1 font-mono text-[10px] uppercase tracking-wider text-ink-mute transition hover:border-ink hover:text-ink"
    >
      <span className="size-1.5 rounded-full bg-good shadow-[0_0_6px_var(--color-good)]" />
      <span>
        {info.label.toLowerCase()} · <span className="text-ink">{key.model}</span>
      </span>
    </button>
  );
}
