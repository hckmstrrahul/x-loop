'use client';

import { useEffect, useState, useTransition } from 'react';
import { Gauge } from './Gauge';
import { PageHead } from './PageHead';
import { KeyDialog } from './KeyDialog';
import { InfoTip } from './InfoTip';
import { authHeaders, useApiKey } from '@/lib/use-api-key';
import type { DraftScore } from '@/lib/types';

const PRED_ORDER: Array<[keyof DraftScore['predicted_actions'], 'good' | 'warn' | 'bad']> = [
  ['follow_author', 'good'],
  ['share_via_dm', 'good'],
  ['profile_click', 'good'],
  ['dwell_time', 'good'],
  ['not_interested', 'warn'],
  ['mute_author', 'warn'],
  ['block_author', 'bad'],
  ['report', 'bad'],
];

function verdictOf(s: DraftScore): { tone: 'pass' | 'warn' | 'fail'; stamp: string } {
  if (s.has_minor_score > 0.4) return { tone: 'fail', stamp: 'blocked' };
  if (s.banger_pool) return { tone: 'pass', stamp: 'banger' };
  if (s.quality_score < 0.4 && s.slop_score >= 0.45) return { tone: 'fail', stamp: 'slop' };
  if (s.quality_score < 0.4) return { tone: 'warn', stamp: 'thin' };
  if (s.slop_score >= 0.3) return { tone: 'warn', stamp: 'salvageable' };
  return { tone: 'warn', stamp: 'awaiting' };
}

export function ComposeView() {
  const [text, setText] = useState('');
  const [score, setScore] = useState<DraftScore | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const { key, hydrated } = useApiKey();

  const len = text.length;
  const hasScore = score !== null;

  // Clear the AI result whenever the text changes — never show stale numbers
  // against fresh text. Forces a re-run.
  useEffect(() => {
    if (score !== null) setScore(null);
    if (aiError !== null) setAiError(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text]);

  function runAiScoring() {
    const draft = text.trim();
    if (!draft) return;
    if (!key) {
      setDialogOpen(true);
      return;
    }
    startTransition(async () => {
      setAiError(null);
      try {
        const res = await fetch('/api/score-draft', {
          method: 'POST',
          headers: { 'content-type': 'application/json', ...authHeaders(key) },
          body: JSON.stringify({ text: draft }),
        });
        if (!res.ok) {
          if (res.status === 401) setAiError('No API key set. Click the badge above to add one.');
          else setAiError('Scoring failed. Check your key, model id, and provider balance.');
          return;
        }
        const data = (await res.json()) as DraftScore;
        setScore(data);
      } catch {
        setAiError('Network error. Try again.');
      }
    });
  }

  const verdict = hasScore ? verdictOf(score) : null;
  const tagDefs: Array<[boolean, string, 'on' | 'warn' | 'bad' | 'good']> = hasScore
    ? [
        [score.tweet_bool_metadata.is_question, 'question', 'on'],
        [score.tweet_bool_metadata.has_link, 'has_link', 'on'],
        [score.tweet_bool_metadata.has_hashtag, 'hashtag', 'on'],
        [score.tweet_bool_metadata.has_mention, 'mention', 'on'],
        [score.tweet_bool_metadata.has_emoji, 'emoji', 'on'],
        [score.tweet_bool_metadata.looks_thread_opener, 'thread-opener', 'warn'],
        [score.tweet_bool_metadata.is_engagement_bait, 'engagement-bait', 'bad'],
        [score.tweet_bool_metadata.all_caps, 'all-caps', 'bad'],
        [score.tweet_bool_metadata.over_280, 'over-280', 'bad'],
        [score.banger_pool, 'banger-pool ✓', 'good'],
      ]
    : [];
  const shownTags = tagDefs.filter((t) => t[0]);

  return (
    <div className="px-14 py-10 max-w-[1320px]">
      <PageHead
        eyebrow="01 · Will this fly?"
        title="Compose"
        highlight="pre-post scorer"
        sub="Score your draft against the same classifier the X For You algorithm uses to decide which posts get amplified. One click, before you publish."
      />

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(360px,0.9fr)]">
        {/* editor */}
        <div className="rounded-md border border-rule bg-panel p-6">
          <div className="mb-3 flex items-center justify-between font-mono text-[10px] uppercase tracking-wider text-ink-mute">
            <span className="text-ink-faint">draft</span>
            <span className={`tnum ${len > 280 ? 'text-bad' : ''}`}>{len} / 280</span>
          </div>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Draft a post. When you're ready, click Run AI scoring on the right to get a real classifier pass."
            className="min-h-[280px] w-full resize-y bg-transparent text-[22px] font-light leading-snug tracking-tight text-ink placeholder:text-ink-faint focus:outline-none"
          />
          <div className="mt-5 flex items-center justify-between gap-4 border-t border-rule pt-4">
            <div className="flex flex-wrap gap-2">
              {shownTags.length === 0 ? (
                <span className="rounded border border-rule bg-paper-2 px-2.5 py-1 font-mono text-[10px] tracking-wider text-ink-mute">
                  {hasScore ? 'no flags' : 'flags appear after scoring'}
                </span>
              ) : (
                shownTags.map(([, label, cls], i) => (
                  <Tag key={i} kind={cls} label={label} />
                ))
              )}
            </div>
            <button
              onClick={runAiScoring}
              disabled={isPending || text.trim().length === 0}
              className="rounded border border-ink bg-ink px-3.5 py-2 text-[12.5px] font-medium text-paper transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {isPending
                ? 'Scoring…'
                : hydrated && !key
                ? 'Set API key →'
                : 'Run AI scoring'}
            </button>
          </div>
        </div>

        {/* telemetry */}
        <aside className="flex flex-col gap-4">
          <VerdictCard
            verdict={verdict}
            score={score}
            aiError={aiError}
            isPending={isPending}
          />

          <div className="rounded-md border border-rule bg-panel p-5">
            <div className="mb-3 flex items-center font-mono text-[10px] uppercase tracking-[0.22em] text-ink-mute">
              banger screen
              <InfoTip label="What is the Banger screen?">
                The X For You algorithm's first quality classifier. Posts must clear quality ≥ 0.40 and stay under slop ≤ 0.30 to enter the pool that gets amplified beyond your followers.
              </InfoTip>
            </div>
            <Gauge
              label="quality"
              value={score?.quality_score ?? 0}
              tone={!hasScore ? 'good' : score.quality_score >= 0.4 ? 'good' : 'bad'}
              threshold={0.4}
            />
            <Gauge
              label="slop"
              value={score?.slop_score ?? 0}
              tone={!hasScore ? 'good' : score.slop_score >= 0.45 ? 'bad' : score.slop_score >= 0.3 ? 'warn' : 'good'}
            />
            <Gauge
              label="minor flags"
              value={score?.has_minor_score ?? 0}
              tone={!hasScore ? 'warn' : score.has_minor_score > 0.4 ? 'bad' : 'warn'}
            />
          </div>

          <div className="rounded-md border border-rule bg-panel p-5">
            <div className="mb-3 flex items-center font-mono text-[10px] uppercase tracking-[0.22em] text-ink-mute">
              predicted phoenix actions
              <InfoTip label="What are Phoenix actions?">
                The eight user reactions the X ranker predicts your post will trigger — follow, DM-share, profile-click, dwell time (positives) and not-interested, mute, block, report (negatives). Negative ones subtract from your score, so a "bait-y" post can score net-negative even with likes.
              </InfoTip>
            </div>
            <div className="grid grid-cols-2 gap-x-6 gap-y-2">
              {PRED_ORDER.map(([k, kind]) => {
                const v = score?.predicted_actions[k] ?? 0;
                let cls = hasScore ? 'text-ink' : 'text-ink-faint';
                if (hasScore && v >= 0.05) {
                  if (kind === 'bad' && v > 0.1) cls = 'text-bad';
                  else if (kind === 'warn' && v > 0.15) cls = 'text-warn';
                  else if (kind === 'good') cls = 'text-good';
                }
                return (
                  <div
                    key={k}
                    className="flex items-center justify-between border-b border-dotted border-rule py-1.5 font-mono text-[11.5px]"
                  >
                    <span className="text-ink-mute">P({k})</span>
                    <span className={`font-medium tnum ${cls}`}>{v.toFixed(3)}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div
            className={`rounded border-l-[3px] bg-panel p-4 text-[14px] leading-snug ${
              verdict?.tone === 'pass'
                ? 'border-l-good'
                : verdict?.tone === 'fail'
                ? 'border-l-bad'
                : 'border-l-warn'
            } border border-rule`}
          >
            <div className="mb-1.5 font-mono text-[10px] uppercase tracking-[0.12em] text-ink-mute">
              {hasScore ? 'AI scorer' : 'awaiting input'}
            </div>
            <div className="text-ink-2">
              {hasScore
                ? score.reasoning
                : 'Write a draft, then run scoring. Results appear here.'}
            </div>
          </div>
        </aside>
      </div>
      <KeyDialog open={dialogOpen} onClose={() => setDialogOpen(false)} />
    </div>
  );
}

function Tag({ kind, label }: { kind: 'on' | 'warn' | 'bad' | 'good'; label: string }) {
  const cls =
    kind === 'good'
      ? 'border-good text-good bg-good-soft'
      : kind === 'bad'
      ? 'border-bad text-bad bg-bad-soft'
      : kind === 'warn'
      ? 'border-warn text-warn bg-warn-soft'
      : 'border-rule-strong text-ink bg-paper-2';
  return (
    <span className={`rounded border px-2.5 py-1 font-mono text-[10px] tracking-wider ${cls}`}>
      {label}
    </span>
  );
}

function VerdictCard({
  verdict,
  score,
  aiError,
  isPending,
}: {
  verdict: { tone: 'pass' | 'warn' | 'fail'; stamp: string } | null;
  score: DraftScore | null;
  aiError: string | null;
  isPending: boolean;
}) {
  const tone = verdict?.tone ?? null;
  const accent =
    tone === 'pass'
      ? 'before:bg-good'
      : tone === 'fail'
      ? 'before:bg-bad'
      : tone === 'warn'
      ? 'before:bg-warn'
      : 'before:bg-rule-strong';
  const stampColor =
    tone === 'pass'
      ? 'text-good'
      : tone === 'fail'
      ? 'text-bad'
      : tone === 'warn'
      ? 'text-warn'
      : 'text-ink-faint';
  const stamp = isPending ? 'scoring…' : verdict?.stamp ?? 'idle';
  return (
    <div
      className={`relative overflow-hidden rounded-md border border-rule bg-panel p-6 before:absolute before:inset-x-0 before:top-0 before:h-[3px] ${accent}`}
    >
      <div className="mb-1.5 flex items-baseline justify-between">
        <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink-mute">
          AI verdict
        </span>
        <span className={`text-[34px] font-medium leading-none tracking-tight ${stampColor}`}>
          {stamp}
        </span>
      </div>
      <div className="text-[14px] leading-snug text-ink-mute">
        {aiError ? (
          <span className="text-bad">{aiError}</span>
        ) : score ? (
          <>
            Quality <span className="text-ink tnum">{score.quality_score.toFixed(2)}</span> · slop{' '}
            <span className="text-ink tnum">{score.slop_score.toFixed(2)}</span>. The Banger pool passes posts with quality ≥ 0.40 and slop ≤ 0.30.
          </>
        ) : (
          <>Draft a post and run scoring to get a real classifier pass against the Banger screen.</>
        )}
      </div>
    </div>
  );
}
