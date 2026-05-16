'use client';

import { useState, useTransition } from 'react';
import { PageHead } from './PageHead';
import { KeyDialog } from './KeyDialog';
import { InfoTip } from './InfoTip';
import { authHeaders, useApiKey } from '@/lib/use-api-key';
import type { QuoteSafety } from '@/lib/types';

const SAMPLES = [
  "Just finished re-reading Calvino's Invisible Cities for the third time. The Octavia chapter still wrecks me.",
  "The truth nobody wants to admit: every legacy media outlet is broken — and here's why nothing will save them. 🚀 A thread 🧵",
  "Graphic battlefield footage shows the aftermath of an overnight artillery strike. Viewer discretion advised.",
];

export function QuoteView() {
  const [text, setText] = useState(SAMPLES[1]);
  const [result, setResult] = useState<QuoteSafety | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const { key, hydrated } = useApiKey();

  function classify(input: string) {
    if (!key) {
      setDialogOpen(true);
      return;
    }
    startTransition(async () => {
      setError(null);
      try {
        const res = await fetch('/api/quote-safety', {
          method: 'POST',
          headers: { 'content-type': 'application/json', ...authHeaders(key) },
          body: JSON.stringify({ text: input }),
        });
        if (!res.ok) {
          if (res.status === 401) setError('No API key set. Click the badge above to add one.');
          else setError('Scoring failed. Check your key, model id, and provider balance.');
          return;
        }
        const data = (await res.json()) as QuoteSafety;
        setResult(data);
      } catch {
        setError('Network error.');
      }
    });
  }

  const verdict = result?.verdict;
  const verdictColor =
    verdict === 'MediumRisk' ? 'text-bad' : verdict === 'LowRisk' ? 'text-warn' : verdict ? 'text-good' : 'text-ink-mute';
  const verdictSub: React.ReactNode =
    verdict === 'MediumRisk'
      ? 'your quote-tweet would inherit MediumRisk · ads removed · monetised reach killed'
      : verdict === 'LowRisk' ? (
        <>
          your quote-tweet would inherit LowRisk · fewer ads placed · out-of-network reach reduced
          <InfoTip label="What is out-of-network reach?">
            Reach to users who don&apos;t already follow you. A LowRisk verdict softens (but doesn&apos;t kill) how far the ranker pushes your post beyond your follower graph.
          </InfoTip>
        </>
      )
      : verdict === 'Safe'
      ? 'safe to quote · full reach · no penalty'
      : 'run classification to see verdict';

  return (
    <div className="max-w-[1320px] px-14 py-10">
      <PageHead
        eyebrow="03 · contagion guard"
        title="Quote"
        highlight="Safety"
        sub="Your quote-tweet's brand-safety verdict is the worse of your post and the original — so a risky quote can drag your own post down. Check before you quote."
      />

      <div className="grid gap-7 md:grid-cols-2">
        <div className="rounded-md border border-rule bg-panel p-6">
          <div className="mb-2.5 font-mono text-[10px] uppercase tracking-[0.22em] text-ink-mute">
            post you'd quote
          </div>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste the post text or a URL…"
            className="min-h-[160px] w-full resize-y rounded border border-rule bg-paper px-4 py-3 text-[16px] text-ink outline-none transition focus:border-bad"
          />
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              onClick={() => setText(SAMPLES[0])}
              className="rounded border border-rule-strong bg-panel px-3 py-1.5 text-[12px] hover:bg-paper-2"
            >
              Sample · clean
            </button>
            <button
              onClick={() => setText(SAMPLES[1])}
              className="rounded border border-rule-strong bg-panel px-3 py-1.5 text-[12px] hover:bg-paper-2"
            >
              Sample · edgy
            </button>
            <button
              onClick={() => setText(SAMPLES[2])}
              className="rounded border border-rule-strong bg-panel px-3 py-1.5 text-[12px] hover:bg-paper-2"
            >
              Sample · risky
            </button>
            <button
              onClick={() => classify(text)}
              disabled={isPending || text.trim().length === 0}
              className="ml-auto rounded border border-ink bg-ink px-4 py-1.5 text-[12.5px] font-medium text-paper hover:opacity-90 disabled:opacity-40"
            >
              {isPending
                ? 'Classifying…'
                : hydrated && !key
                ? 'Set API key →'
                : 'Run AI classification'}
            </button>
          </div>
        </div>

        <div className="rounded-md border border-rule bg-panel p-6">
          <div className="mb-2.5 font-mono text-[10px] uppercase tracking-[0.22em] text-ink-mute">
            computed verdict
          </div>
          <div className={`mb-1 text-[80px] font-light leading-none tracking-tight ${verdictColor}`}>
            {verdict ?? '—'}
          </div>
          <div className="mb-5 flex flex-wrap items-center font-mono text-[11px] uppercase tracking-wider text-ink-mute">
            {verdictSub}
          </div>

          {error && (
            <div className="mb-4 rounded border border-bad bg-bad-soft px-3 py-2 text-bad">{error}</div>
          )}

          {result && (
            <>
              <div className="mt-4 space-y-2">
                {result.labels.map((l, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between border-b border-dotted border-rule pb-2 font-mono text-[11.5px]"
                  >
                    <span className="text-ink">{l.name}</span>
                    <span className="text-[9.5px] uppercase tracking-wider text-ink-mute">
                      {l.source}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-6 rounded border border-dashed border-rule-strong bg-paper p-4 font-mono text-[11px] leading-relaxed text-ink-mute">
                <div>
                  <span className="text-ink">you</span> · <span className="text-good">Safe</span>{' '}
                  <span className="text-bad">⟶ QT ⟶</span>{' '}
                  <span className="text-ink">quoted</span> ·{' '}
                  <span className={verdictColor}>{verdict}</span>
                </div>
                <div className="mt-1">
                  resulting verdict on your post:{' '}
                  <span className={verdictColor}>{verdict}</span>
                </div>
              </div>

              <div className="mt-5 text-[14px] leading-snug text-ink-2">{result.reasoning}</div>
            </>
          )}
        </div>
      </div>
      <KeyDialog open={dialogOpen} onClose={() => setDialogOpen(false)} />
    </div>
  );
}
