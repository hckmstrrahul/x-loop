'use client';

import { useMemo, useState, useTransition } from 'react';
import { PageHead } from './PageHead';
import { StatCard } from './StatCard';
import { Scatter } from './Scatter';
import { KeyDialog } from './KeyDialog';
import { InfoTip } from './InfoTip';
import { authHeaders, useApiKey } from '@/lib/use-api-key';
import { clusterArchetypes, computeSummary } from '@/lib/analysis';
import type { ScoredPost } from '@/lib/types';

const SAMPLE_PASTE = `73% of B2B landing pages bury the actual product below the fold.

The fastest way to ruin a good feature is to ship it with bad copy.

🚀 Here's why every product page is broken — a thread 🧵🔥

RT if you've ever rewritten a paragraph three times and gone back to the original.

I was wrong about TypeScript strict mode. Here's what changed my mind: the noise/signal ratio on caught bugs is way better than I thought.`;

function splitPosts(raw: string): string[] {
  const chunks = raw
    .split(/\n\s*(?:---+\s*)?\n+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
  return Array.from(new Set(chunks));
}

// Stable per-row id so React keys survive deletions and the user can
// undo without React reordering rows.
let __postIdSeq = 0;
function tag(s: ScoredPost): ScoredPost & { _id: number } {
  return { ...s, _id: ++__postIdSeq };
}

type Tagged = ScoredPost & { _id: number };

export function HistoryView() {
  const [paste, setPaste] = useState('');
  const [scored, setScored] = useState<Tagged[] | null>(null);
  const [requested, setRequested] = useState(0);
  const [trashed, setTrashed] = useState<Tagged[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const { key, hydrated } = useApiKey();

  const posts = useMemo(() => splitPosts(paste), [paste]);
  const tooMany = posts.length > 200;

  const summary = useMemo(() => (scored ? computeSummary(scored) : null), [scored]);
  const archetypes = useMemo(() => (scored ? clusterArchetypes(scored) : []), [scored]);

  function run() {
    if (!key) {
      setDialogOpen(true);
      return;
    }
    if (posts.length === 0) return;
    startTransition(async () => {
      setError(null);
      try {
        const res = await fetch('/api/history', {
          method: 'POST',
          headers: { 'content-type': 'application/json', ...authHeaders(key) },
          body: JSON.stringify({ posts }),
        });
        if (!res.ok) {
          if (res.status === 401) setError('No API key set. Click the badge above.');
          else if (res.status === 400) setError('Input rejected. Posts may be empty or over the 200 cap.');
          else setError('Batch scoring failed. Check your provider balance and rate limits.');
          return;
        }
        const data = (await res.json()) as { scored: ScoredPost[]; requested: number };
        setScored(data.scored.map(tag));
        setRequested(data.requested);
        setTrashed([]);
      } catch {
        setError('Network error.');
      }
    });
  }

  function deletePost(id: number) {
    if (!scored) return;
    const target = scored.find((p) => p._id === id);
    if (!target) return;
    setScored(scored.filter((p) => p._id !== id));
    setTrashed((t) => [target, ...t]);
  }

  function undoLastDelete() {
    if (trashed.length === 0 || !scored) return;
    const [head, ...rest] = trashed;
    setScored([head, ...scored]);
    setTrashed(rest);
  }

  function clearResults() {
    setScored(null);
    setTrashed([]);
    setRequested(0);
  }

  return (
    <div className="max-w-[1320px] px-14 py-10">
      <PageHead
        eyebrow="04 · archetype mining"
        title="Banger"
        highlight="History"
        sub="Paste your recent posts — one per blank line. We score each one and group together the post structures that consistently clear the Banger threshold. Delete any post from the results to refine the analysis."
      />

      <div className="mb-7 rounded-md border border-rule bg-panel p-6">
        <div className="mb-3 flex items-center justify-between font-mono text-[10px] uppercase tracking-wider text-ink-mute">
          <span>posts · separate with a blank line or ---</span>
          <span className={`tnum ${tooMany ? 'text-bad' : ''}`}>{posts.length} / 200</span>
        </div>
        <textarea
          value={paste}
          onChange={(e) => setPaste(e.target.value)}
          placeholder={SAMPLE_PASTE}
          className="min-h-[200px] w-full resize-y rounded border border-rule bg-paper px-4 py-3 text-[14.5px] leading-relaxed text-ink outline-none transition focus:border-bad"
        />
        <div className="mt-4 flex items-center justify-between gap-3">
          <button
            onClick={() => setPaste(SAMPLE_PASTE)}
            className="text-[12.5px] text-ink-mute transition hover:text-bad"
          >
            Load sample
          </button>
          <div className="flex items-center gap-3">
            {tooMany && (
              <span className="font-mono text-[10px] uppercase tracking-wider text-bad">
                over 200 — split into batches
              </span>
            )}
            <button
              onClick={run}
              disabled={isPending || posts.length === 0 || tooMany}
              className="rounded border border-ink bg-ink px-4 py-2 text-[13px] font-medium text-paper transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {isPending
                ? `Scoring ${posts.length} posts…`
                : hydrated && !key
                ? 'Set API key →'
                : `Score ${posts.length || ''} ${posts.length === 1 ? 'post' : 'posts'}`}
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-6 rounded border border-bad bg-bad-soft px-4 py-3 text-bad">{error}</div>
      )}

      {scored && summary && (
        <>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-mute">
              {summary.posts_scored} of {requested} posts scored
              {trashed.length > 0 && <span> · {trashed.length} deleted</span>}
            </div>
            <div className="flex items-center gap-3">
              {trashed.length > 0 && (
                <button
                  onClick={undoLastDelete}
                  className="font-mono text-[10px] uppercase tracking-wider text-ink-mute transition hover:text-ink"
                >
                  ↩ undo delete
                </button>
              )}
              <button
                onClick={clearResults}
                className="font-mono text-[10px] uppercase tracking-wider text-ink-mute transition hover:text-bad"
              >
                clear results
              </button>
            </div>
          </div>

          <div className="mb-7 grid grid-cols-2 gap-4 md:grid-cols-5">
            <StatCard
              label="posts scored"
              value={String(summary.posts_scored)}
              delta={requested > summary.posts_scored ? `${requested - summary.posts_scored} excluded` : 'all included'}
              deltaTone={requested > summary.posts_scored ? 'mute' : 'good'}
            />
            <StatCard
              label="banger rate"
              value={Math.round(summary.banger_rate * 100) + '%'}
              delta="q ≥ 0.40, slop ≤ 0.30"
              deltaTone="good"
            />
            <StatCard
              label="slop rate"
              value={Math.round(summary.slop_rate * 100) + '%'}
              delta="slop ≥ 0.50"
              deltaTone="bad"
            />
            <StatCard
              label="median quality"
              value={summary.median_quality.toFixed(2)}
              delta={summary.median_quality < 0.4 ? 'below banger line' : 'on or above'}
              deltaTone={summary.median_quality < 0.4 ? 'bad' : 'good'}
            />
            <StatCard
              label="minor flags"
              value={String(summary.minor_flagged)}
              delta={summary.minor_flagged > 0 ? 'review urgently' : 'clean'}
              deltaTone={summary.minor_flagged > 0 ? 'bad' : 'good'}
            />
          </div>

          {scored.length > 0 ? (
            <>
              <div className="mb-7 rounded-md border border-rule bg-panel p-6">
                <div className="mb-4 flex items-baseline justify-between border-b border-rule pb-3">
                  <div className="text-[24px] font-light tracking-tight text-ink">
                    quality × slop
                  </div>
                  <div className="flex gap-4 font-mono text-[10px] tracking-wider text-ink-mute">
                    <span>
                      <i className="mr-1.5 inline-block size-2 rounded-full bg-good align-middle" />
                      banger
                    </span>
                    <span>
                      <i className="mr-1.5 inline-block size-2 rounded-full bg-warn align-middle" />
                      liminal
                    </span>
                    <span>
                      <i className="mr-1.5 inline-block size-2 rounded-full bg-bad align-middle" />
                      slop / suppressed
                    </span>
                  </div>
                </div>
                <Scatter
                  points={scored.map((s) => ({
                    quality: s.score.quality_score,
                    slop: s.score.slop_score,
                  }))}
                />
              </div>

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
                {archetypes.map((a) => {
                  const isAvoid = a.kind === 'avoid';
                  const eyebrowLabel =
                    a.kind === 'highest-yield'
                      ? 'archetype · highest yield'
                      : a.kind === 'steady-earner'
                      ? 'archetype · steady earner'
                      : a.kind === 'sleeper-hit'
                      ? 'archetype · sleeper hit'
                      : a.kind === 'avoid'
                      ? 'archetype · avoid'
                      : 'archetype · neutral';
                  const tip =
                    a.kind === 'highest-yield'
                      ? 'The structures in your history that clear the Banger threshold the most reliably. Lean into these.'
                      : a.kind === 'steady-earner'
                      ? 'Mid-tier performers — reliable but not standout. A safe baseline to keep posting.'
                      : a.kind === 'sleeper-hit'
                      ? 'Posts that look weak on paper but outperform — high variance. Worth experimenting with.'
                      : a.kind === 'avoid'
                      ? 'Structures that consistently fail the Banger threshold or trigger negative-action predictions. Retire these.'
                      : 'Posts that did not fit a clear archetype. Skim manually to spot an emerging pattern.';
                  return (
                    <article
                      key={a.rank}
                      className="relative overflow-hidden rounded-md border border-rule bg-panel p-6"
                    >
                      <span className="absolute top-2 right-4 text-[56px] font-light leading-none text-ink-faint opacity-30">
                        {String(a.rank).padStart(2, '0')}
                      </span>
                      <div
                        className={`mb-2.5 flex items-center font-mono text-[9.5px] uppercase tracking-wider ${
                          isAvoid ? 'text-bad' : 'text-good'
                        }`}
                      >
                        {eyebrowLabel}
                        <InfoTip label="What does this archetype mean?">{tip}</InfoTip>
                      </div>
                      <h3 className="mb-3 text-[22px] font-medium leading-tight tracking-tight text-ink">
                        {a.title}
                      </h3>
                      <p className="mb-4 text-[13px] leading-snug text-ink-mute">{a.description}</p>
                      <div className="flex flex-wrap gap-4 border-t border-dotted border-rule pt-3 font-mono text-[10px] text-ink tracking-wider tnum">
                        <span>
                          n = <b className={isAvoid ? 'text-bad' : 'text-good'}>{a.n}</b>
                        </span>
                        <span>
                          q̄ ={' '}
                          <b className={a.mean_quality < 0.4 ? 'text-bad' : 'text-good'}>
                            {a.mean_quality.toFixed(2)}
                          </b>
                        </span>
                        <span>
                          banger ·{' '}
                          <b className={a.banger_rate >= 0.4 ? 'text-good' : 'text-bad'}>
                            {Math.round(a.banger_rate * 100)}%
                          </b>
                        </span>
                      </div>
                    </article>
                  );
                })}
              </div>

              <details className="mt-7 rounded-md border border-rule bg-panel p-5" open>
                <summary className="cursor-pointer font-mono text-[10px] uppercase tracking-[0.22em] text-ink-mute">
                  per-post scores ({scored.length}) · click × to remove
                </summary>
                <div className="mt-4 space-y-1">
                  {scored.map((s) => {
                    const banger =
                      s.score.quality_score >= 0.4 && s.score.slop_score <= 0.3;
                    return (
                      <div
                        key={s._id}
                        className="group grid grid-cols-[60px_1fr_auto_28px] items-start gap-4 rounded border border-transparent px-2 py-2 transition hover:border-rule hover:bg-paper-2"
                      >
                        <div
                          className={`font-mono text-[11px] tracking-wider tnum ${
                            banger ? 'text-good' : 'text-bad'
                          }`}
                        >
                          q {s.score.quality_score.toFixed(2)}
                          <br />s {s.score.slop_score.toFixed(2)}
                        </div>
                        <div className="text-[14px] leading-snug text-ink">{s.text}</div>
                        <div
                          className={`font-mono text-[10px] uppercase tracking-wider ${
                            banger ? 'text-good' : 'text-ink-mute'
                          }`}
                        >
                          {banger ? '✓ banger' : '—'}
                        </div>
                        <button
                          onClick={() => deletePost(s._id)}
                          aria-label="Remove post from analysis"
                          title="Remove from analysis"
                          className="flex size-7 items-center justify-center rounded text-ink-faint opacity-0 transition group-hover:opacity-100 hover:bg-bad-soft hover:text-bad"
                        >
                          ✕
                        </button>
                      </div>
                    );
                  })}
                </div>
              </details>
            </>
          ) : (
            <div className="rounded border border-dashed border-rule-strong p-10 text-center text-ink-mute">
              All posts deleted. Use <em className="not-italic text-ink">undo delete</em> above, or
              clear and re-paste to start over.
            </div>
          )}
        </>
      )}

      <KeyDialog open={dialogOpen} onClose={() => setDialogOpen(false)} />
    </div>
  );
}
