# x/loop

Personal creator workbench built on the open-sourced X For You algorithm ([xai-org/x-algorithm](https://github.com/xai-org/x-algorithm)). Pre-score drafts against the Banger screen, check quote-safety contagion, mine archetypes from your post history.

Single-user, BYOK (bring-your-own-key), no X API dependency. Runs locally or on a private Vercel deploy.

## Three working tools

| View | What it does | Backend | Cost per use |
|---|---|---|---|
| **Compose** | Score a draft against the Banger screen prompt (quality / slop / minor / predicted Phoenix actions) | BYOK LLM | ~$0.005 |
| **Quote Safety** | Classify a post you'd quote-tweet against the brand-safety verdict tiers (Safe / LowRisk / MediumRisk) | BYOK LLM | ~$0.005 |
| **Banger History** | Paste your last 50–200 posts, get scored and clustered into archetypes | BYOK LLM (batched, concurrency=6) | ~$0.10–4 |

No X API key is needed for any of this. Banger History takes a paste; you can also paste anyone else's posts to benchmark.

## Bring your own key

Click the badge in the top-right or the **API key** button in the sidebar:

- Pick a provider (Grok / Claude / GPT / Gemini)
- Paste your key, pick a model, save

The key is stored only in **your browser's localStorage**. On each AI request it's sent through a thin proxy route on this site directly to the provider — never logged, never persisted, never written to disk. Clear it from the same dialog any time.

### Why Grok is recommended

The X For You ranker uses a Grok-family vision-language model (`VLM_PRIMARY` in the open-sourced repo) to run the `BangerMiniVlmScreenScore` prompt — the exact classifier this app reproduces. Scoring with Grok gives the highest fidelity to the live decision that gates whether your post enters the Banger pool. Claude, GPT, and Gemini all work and are well-calibrated, but Grok is closest to ground truth by construction.

## Local development

```bash
pnpm install
pnpm dev
```

Open <http://localhost:3000>. Configure your API key in the dialog. Done.

## Deploy to Vercel (single-user, private)

```bash
vercel
```

Two patterns for keeping the deploy private:

**A. Vercel password protection** (simplest, paid plans only).

**B. HTTP Basic Auth via the included proxy** (free, all plans). Set these two env vars in your Vercel project settings:

```
BASIC_AUTH_USER=your_username
BASIC_AUTH_PASS=long_random_password
```

When both are set, every route requires Basic Auth. When either is unset, the proxy is a no-op and the app is public. See `proxy.ts`.

## Security model

- **Storage.** Keys live in `localStorage` under `xloop.byok.v1`. They're sent only on AI-scoring requests, in headers (`x-llm-provider`, `x-llm-model`, `x-llm-key`).
- **Transit.** HTTPS-only in production (Vercel handles this).
- **Server.** Each route extracts the key from the request header, validates the provider against an allowlist, instantiates the provider SDK with the key, makes one call, and discards everything. No logging of header contents, no persistence.
- **Failure messages.** Errors from provider SDKs sometimes include the key in the message. The routes catch errors and return a generic `scoring_failed` status; only a clipped `err.message.slice(0, 200)` is logged server-side. Provider output is never echoed verbatim to the client.
- **Validation.** Provider in `{xai, anthropic, openai, google}`. Model id is alphanumeric + `._-:/`, max 64 chars. Key length 8–256, no whitespace. Body input lengths capped per route.

## Stack

- **Next.js 16** App Router (Turbopack)
- **Tailwind CSS v4** (CSS-first config in `app/globals.css`)
- **AI SDK v6** (`generateText` + `Output.object()`)
- Provider SDKs: `@ai-sdk/xai`, `@ai-sdk/anthropic`, `@ai-sdk/openai`, `@ai-sdk/google`
- **Zod** for input + output schema validation on every route
- **Geist Sans + JetBrains Mono** via `next/font`

## Project layout

```
app/
  api/
    score-draft/route.ts     ← single-post Banger screen scorer
    quote-safety/route.ts    ← brand-safety classifier
    history/route.ts         ← batch scorer (paste-driven, concurrency=6)
  compose/page.tsx
  quote/page.tsx
  history/page.tsx
  how-to-use/page.tsx
  boundaries/page.tsx
  layout.tsx
  page.tsx                   ← redirects to /compose
  globals.css
components/
  Shell.tsx                  ← rail + topbar + KeyDialog mount
  KeyDialog.tsx              ← provider/model picker, key input
  ProviderBadge.tsx          ← active provider indicator
  PageHead.tsx
  ComposeView.tsx
  QuoteView.tsx
  HistoryView.tsx
  Gauge.tsx
  StatCard.tsx
  Scatter.tsx
lib/
  providers.ts               ← provider catalog + BYOK model factory
  use-api-key.ts             ← localStorage hook + auth header builder
  llm-model.ts               ← request → validated model instance
  prompts.ts                 ← system prompts mirroring the X classifiers
  types.ts                   ← shared schemas
proxy.ts                     ← optional Basic Auth gate
```

## Boundaries

Read `/boundaries` in the running app. No safety-classifier evasion, no coordinated abuse, no engagement inflation.
