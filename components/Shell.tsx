'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { KeyDialog } from './KeyDialog';
import { ProviderBadge } from './ProviderBadge';

type NavItem = {
  href: string;
  label: string;
  glyph: string;
  section: 'workspace' | 'reference';
};

const NAV: NavItem[] = [
  { href: '/compose', label: 'Compose', glyph: '▸', section: 'workspace' },
  { href: '/quote', label: 'Quote Safety', glyph: '"', section: 'workspace' },
  { href: '/history', label: 'Banger History', glyph: '≋', section: 'workspace' },
  { href: '/how-to-use', label: 'How to Use', glyph: '?', section: 'reference' },
  { href: '/boundaries', label: 'Boundaries', glyph: '!', section: 'reference' },
];

const LABEL_MAP: Record<string, string> = {
  '/compose': 'compose',
  '/quote': 'quote safety',
  '/history': 'banger history',
  '/how-to-use': 'how to use',
  '/boundaries': 'boundaries',
};

export function Shell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const workspace = NAV.filter((i) => i.section === 'workspace');
  const reference = NAV.filter((i) => i.section === 'reference');
  const currentLabel = LABEL_MAP[pathname] ?? '—';
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <div className="grid h-screen grid-cols-[240px_1fr] grid-rows-[64px_1fr]">
      <aside className="row-span-2 flex flex-col border-r border-rule bg-panel">
        <div className="flex items-baseline gap-2 border-b border-rule px-6 py-5">
          <span className="text-[28px] font-semibold leading-none tracking-tight text-ink">
            x<span className="text-bad">/</span>loop
          </span>
          <span className="ml-auto font-mono text-[9px] uppercase tracking-[0.18em] text-ink-faint">
            v0.1
          </span>
        </div>

        <div className="px-6 pt-5 pb-2 font-mono text-[9px] uppercase tracking-[0.22em] text-ink-faint">
          workspace
        </div>
        <nav className="flex flex-col gap-px px-3">
          {workspace.map((item) => (
            <NavLink key={item.href} item={item} active={pathname === item.href} />
          ))}
        </nav>

        <div className="px-6 pt-5 pb-2 font-mono text-[9px] uppercase tracking-[0.22em] text-ink-faint">
          reference
        </div>
        <nav className="flex flex-col gap-px px-3">
          {reference.map((item) => (
            <NavLink key={item.href} item={item} active={pathname === item.href} />
          ))}
        </nav>

        <button
          onClick={() => setDialogOpen(true)}
          className="mx-3 mt-5 flex items-center gap-2.5 rounded border border-rule px-3 py-2 text-left text-[13px] text-ink-mute transition hover:border-ink hover:text-ink"
        >
          <span className="w-4 font-mono text-[10px] text-ink-faint">⚙</span>
          API key
        </button>

        <div className="mt-auto border-t border-rule px-6 py-4 font-mono text-[10px] leading-relaxed text-ink-faint tracking-wide">
          <div className="flex justify-between">
            <span>byok</span>
            <span className="text-good">local-only</span>
          </div>
          <div className="flex justify-between">
            <span>mode</span>
            <span className="text-ink-mute">single-user</span>
          </div>
          <a
            href="https://github.com/xai-org/x-algorithm"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 flex items-center gap-1.5 rounded border border-rule px-2 py-1.5 text-ink-mute transition hover:border-ink hover:text-ink"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
            </svg>
            <span className="flex-1">source · xai-org/x-algorithm</span>
            <span aria-hidden>↗</span>
          </a>
        </div>
      </aside>

      <header className="col-start-2 flex items-center justify-between border-b border-rule bg-panel px-8">
        <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-mute">
          workspace / <span className="font-medium text-ink">{currentLabel}</span>
        </div>
        <div className="flex items-center gap-2">
          <ProviderBadge onOpen={() => setDialogOpen(true)} />
        </div>
      </header>

      <main className="col-start-2 overflow-y-auto overflow-x-hidden bg-paper">{children}</main>

      <KeyDialog open={dialogOpen} onClose={() => setDialogOpen(false)} />
    </div>
  );
}

function NavLink({ item, active }: { item: NavItem; active: boolean }) {
  return (
    <Link
      href={item.href}
      className={`group flex items-center gap-2.5 rounded px-3 py-2 text-[13.5px] transition ${
        active
          ? 'bg-paper-2 text-ink shadow-[inset_2px_0_0_var(--color-bad)]'
          : 'text-ink-mute hover:bg-paper-2 hover:text-ink'
      }`}
    >
      <span
        className={`w-4 font-mono text-[10px] ${active ? 'text-bad' : 'text-ink-faint'}`}
      >
        {item.glyph}
      </span>
      {item.label}
    </Link>
  );
}
