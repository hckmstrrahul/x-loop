import { NextResponse } from 'next/server';
import { generateText, Output } from 'ai';
import { z } from 'zod';
import { modelFromRequest } from '@/lib/llm-model';
import { QUOTE_SAFETY_SYSTEM } from '@/lib/prompts';

export const runtime = 'nodejs';

const Input = z.object({
  text: z.string().min(1).max(4000),
});

const QuoteSchema = z.object({
  verdict: z.enum(['Safe', 'LowRisk', 'MediumRisk']),
  labels: z
    .array(z.object({ name: z.string(), source: z.string() }))
    .max(12),
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

  try {
    const { output } = await generateText({
      model: llm.model,
      output: Output.object({ schema: QuoteSchema }),
      system: QUOTE_SAFETY_SYSTEM,
      prompt: `Post to classify:\n\n"""\n${parsed.data.text}\n"""\n\nReturn the JSON object.`,
      temperature: 0.1,
    });
    return NextResponse.json(output);
  } catch (err) {
    console.error('quote-safety failed:', describeError(err));
    return NextResponse.json({ error: 'scoring_failed' }, { status: 502 });
  }
}

function describeError(err: unknown): string {
  if (err instanceof Error) return err.name + ': ' + err.message.slice(0, 200);
  return 'unknown';
}
