import type { HistoryArchetype, ScoredPost } from './types';

export type HistorySummary = {
  posts_scored: number;
  banger_rate: number;
  slop_rate: number;
  median_quality: number;
  minor_flagged: number;
};

export function computeSummary(scored: ScoredPost[]): HistorySummary {
  const total = scored.length;
  if (total === 0) {
    return {
      posts_scored: 0,
      banger_rate: 0,
      slop_rate: 0,
      median_quality: 0,
      minor_flagged: 0,
    };
  }
  const banger = scored.filter(
    (s) => s.score.quality_score >= 0.4 && s.score.slop_score <= 0.3,
  ).length;
  const slop = scored.filter((s) => s.score.slop_score >= 0.5).length;
  const minor = scored.filter((s) => s.score.has_minor_score > 0.4).length;
  const sortedQ = scored.map((s) => s.score.quality_score).sort((a, b) => a - b);
  const median = sortedQ[Math.floor(sortedQ.length / 2)] ?? 0;
  return {
    posts_scored: total,
    banger_rate: banger / total,
    slop_rate: slop / total,
    median_quality: Math.round(median * 100) / 100,
    minor_flagged: minor,
  };
}

type Bucket = {
  key: string;
  title: string;
  description: string;
  kind: HistoryArchetype['kind'];
  match: (p: ScoredPost) => boolean;
};

const BUCKETS: Bucket[] = [
  {
    key: 'specific-number',
    title: 'Specific number, contrarian frame, no emoji',
    description:
      '"73% of X is Y" structure — a concrete claim, no thread tease, no rocket. Highest hit rate.',
    kind: 'highest-yield',
    match: (p) =>
      !p.score.tweet_bool_metadata.has_emoji &&
      !p.score.tweet_bool_metadata.looks_thread_opener &&
      /\b\d+(\.\d+)?(%|x|k|m|b)?\b/i.test(p.text) &&
      p.score.quality_score >= 0.4,
  },
  {
    key: 'question',
    title: 'A question that lands',
    description:
      'A question with enough specificity to provoke a reply. High profile_click signal.',
    kind: 'steady-earner',
    match: (p) =>
      p.score.tweet_bool_metadata.is_question &&
      !p.score.tweet_bool_metadata.is_engagement_bait &&
      p.score.quality_score >= 0.4,
  },
  {
    key: 'craft-note',
    title: 'One-line craft note from inside a discipline',
    description:
      'Insider observation that reads as private knowledge. No emoji, no question, decent quality.',
    kind: 'steady-earner',
    match: (p) =>
      !p.score.tweet_bool_metadata.has_emoji &&
      !p.score.tweet_bool_metadata.is_question &&
      !p.score.tweet_bool_metadata.looks_thread_opener &&
      p.score.quality_score >= 0.4 &&
      p.score.slop_score <= 0.2 &&
      p.text.length <= 220,
  },
  {
    key: 'thread-rocket',
    title: 'Thread opener with rocket/fire stack',
    description:
      'Banger screen tags these as slop. Block/mute predictions spike. Retire.',
    kind: 'avoid',
    match: (p) =>
      (p.score.tweet_bool_metadata.looks_thread_opener || /[🚀✨🔥💯]/.test(p.text)) &&
      p.score.slop_score >= 0.4,
  },
  {
    key: 'engagement-bait',
    title: 'Engagement bait ("RT if you agree")',
    description:
      'High predicted not_interested + mute_author. Net negative even when likes are high.',
    kind: 'avoid',
    match: (p) => p.score.tweet_bool_metadata.is_engagement_bait,
  },
];

export function clusterArchetypes(scored: ScoredPost[]): HistoryArchetype[] {
  const used = new Set<number>();
  const out: HistoryArchetype[] = [];
  let rank = 1;

  for (const b of BUCKETS) {
    const hits: ScoredPost[] = [];
    scored.forEach((s, i) => {
      if (used.has(i)) return;
      if (b.match(s)) {
        hits.push(s);
        used.add(i);
      }
    });
    if (hits.length === 0) continue;
    out.push(stats(rank++, b.kind, b.title, b.description, hits));
  }

  const leftover = scored.filter((_, i) => !used.has(i));
  if (leftover.length > 0) {
    out.push(
      stats(
        rank++,
        'neutral',
        'Everything else',
        "Posts that didn't fit a clear archetype. Skim these manually to find an emerging pattern worth promoting.",
        leftover,
      ),
    );
  }

  return out;
}

function stats(
  rank: number,
  kind: HistoryArchetype['kind'],
  title: string,
  description: string,
  hits: ScoredPost[],
): HistoryArchetype {
  const meanQ = hits.reduce((a, x) => a + x.score.quality_score, 0) / hits.length;
  const meanS = hits.reduce((a, x) => a + x.score.slop_score, 0) / hits.length;
  const bangerRate =
    hits.filter((x) => x.score.quality_score >= 0.4 && x.score.slop_score <= 0.3).length /
    hits.length;
  return {
    rank,
    kind,
    title,
    description,
    n: hits.length,
    mean_quality: Math.round(meanQ * 100) / 100,
    mean_slop: Math.round(meanS * 100) / 100,
    banger_rate: Math.round(bangerRate * 100) / 100,
  };
}
