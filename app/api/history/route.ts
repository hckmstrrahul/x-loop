import { NextResponse } from 'next/server';
import { generateText, Output } from 'ai';
import { z } from 'zod';
import { modelFromRequest } from '@/lib/llm-model';
import { BANGER_SCREEN_SYSTEM } from '@/lib/prompts';
import type { DraftScore, ScoredPost } from '@/lib/types';

export const runtime = 'nodejs';

// Cap batch size — covers a 90-day backfill at typical cadence.
const MAX_POSTS = 200;
// How many LLM calls run in parallel. Higher = faster, but more likely
// to trip provider rate limits.
const CONCURRENCY = 6;

const Input = z.object({
  posts: z.array(z.string().min(1).max(2000)).min(1).max(MAX_POSTS),
});

const ScoreSchema = z.object({
  quality_score: z.number().min(0).max(1),
  slop_score: z.number().min(0).max(1),
  has_minor_score: z.number().min(0).max(1),
  banger_pool: z.boolean(),
  tweet_bool_metadata: z.object({
    is_question: z.boolean(),
    has_link: z.boolean(),
    has_hashtag: z.boolean(),
    has_mention: z.boolean(),
    has_emoji: z.boolean(),
    is_engagement_bait: z.boolean(),
    looks_thread_opener: z.boolean(),
    all_caps: z.boolean(),
    over_280: z.boolean(),
  }),
  predicted_actions: z.object({
    follow_author: z.number().min(0).max(1),
    share_via_dm: z.number().min(0).max(1),
    profile_click: z.number().min(0).max(1),
    dwell_time: z.number().min(0).max(1),
    not_interested: z.number().min(0).max(1),
    mute_author: z.number().min(0).max(1),
    block_author: z.number().min(0).max(1),
    report: z.number().min(0).max(1),
  }),
  reasoning: z.string().min(1).max(800),
});

export async function POST(req: Request) {
  const llm = modelFromRequest(req);
  if (!llm.ok) {
    if (llm.reason === 'missing') {
      return NextResponse.json({ error: 'key_required' }, { status: 401 });
    }
    return NextResponse.json({ error: 'invalid_credentials' }, { status: 400 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }

  const parsed = Input.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'invalid_input' }, { status: 400 });
  }

  const posts = parsed.data.posts;
  const model = llm.model;

  async function scoreOne(text: string): Promise<DraftScore | null> {
    try {
      const { output } = await generateText({
        model,
        output: Output.object({ schema: ScoreSchema }),
        system: BANGER_SCREEN_SYSTEM,
        prompt: `Post to score:\n\n"""\n${text}\n"""\n\nReturn the JSON object.`,
        temperature: 0.1,
      });
      return output as DraftScore;
    } catch (err) {
      console.error('history batch · score failed:', describeError(err));
      return null;
    }
  }

  const results: Array<ScoredPost | null> = new Array(posts.length).fill(null);
  let cursor = 0;
  async function worker() {
    while (cursor < posts.length) {
      const i = cursor++;
      const score = await scoreOne(posts[i]);
      results[i] = score ? { text: posts[i], score } : null;
    }
  }
  await Promise.all(Array.from({ length: Math.min(CONCURRENCY, posts.length) }, worker));

  const scored: ScoredPost[] = results.filter((r): r is ScoredPost => r !== null);
  if (scored.length === 0) {
    return NextResponse.json({ error: 'all_failed' }, { status: 502 });
  }

  return NextResponse.json({ scored, requested: posts.length });
}

function describeError(err: unknown): string {
  if (err instanceof Error) return err.name + ': ' + err.message.slice(0, 200);
  return 'unknown';
}
