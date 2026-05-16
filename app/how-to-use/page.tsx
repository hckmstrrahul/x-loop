import { PageHead } from '@/components/PageHead';

const CARDS = [
  {
    num: '— 01 —',
    title: 'Compose · "Will this fly?"',
    def: (
      <>
        A pre-post scorer that mirrors the way the X For You algorithm actually scores posts.
        Draft yours and click Run AI scoring for a real classifier verdict on quality, slop,
        minor-content flags, and the eight predicted user reactions that drive reach. Editing
        the draft clears the result so you&apos;re never reading stale numbers.
      </>
    ),
    example: (
      <>
        <b>Try:</b> "73% of B2B landing pages bury the actual product below the fold."
        <br />
        <em className="text-good not-italic">→ quality 0.58 · slop 0.04 · banger ✓</em>
        <br />
        <br />
        <b>vs.</b> "🚀 Here's why every product page is broken — a thread 🧵🔥"
        <br />
        <em className="text-good not-italic">→ quality 0.22 · slop 0.61 · banger ✗</em>
      </>
    ),
    why: (
      <>
        <b>Why it matters.</b> Posts that come in below quality 0.40 or with high slop get
        suppressed in early distribution — and posts that the model thinks will get muted or
        reported are pushed down too. Catching either of those before you publish saves the
        early-reach window you&apos;d otherwise burn on a post that won&apos;t fly.
      </>
    ),
  },
  {
    num: '— 02 —',
    title: 'Quote Safety Guard',
    def: (
      <>
        Before you QT, paste the original. We classify against the X brand-safety verdict tiers —{' '}
        <em className="not-italic">Safe</em>, <em className="not-italic">LowRisk</em>,{' '}
        <em className="not-italic">MediumRisk</em> — and show which labels triggered. MediumRisk on
        either side wins.
      </>
    ),
    example: (
      <>
        <b>Try:</b> paste a post containing graphic conflict imagery
        <br />
        <em className="not-italic text-good">
          → verdict: MediumRisk · labels: GORE_AND_VIOLENCE_HIGH_PRECISION
        </em>
        <br />
        <em className="not-italic text-good">→ your QT inherits MediumRisk · ads will not place adjacent</em>
      </>
    ),
    why: (
      <>
        <b>Why it matters.</b> The verdict on a QT is computed as{' '}
        <span className="font-mono text-[12px] text-ink-mute">worst_verdict(yours, quoted)</span>.
        A single careless quote can demonetize a week of work. The only utility here that pays for
        itself in a single use.
      </>
    ),
  },
  {
    num: '— 03 —',
    title: 'Banger History',
    def: (
      <>
        Paste your recent posts (one per blank line, or separated by{' '}
        <span className="font-mono text-[13px] text-ink-mute">---</span>). We score each through
        the same Banger screen prompt and cluster the structures that systematically beat 0.40.
        You get archetypes — concrete templates you've already proved out — not vibes.
      </>
    ),
    example: (
      <>
        <b>Try:</b> paste 50–200 of your last 90 days of posts
        <br />
        <em className="not-italic text-good">→ archetype #1 "specific number, contrarian frame"</em>
        <br />
        <em className="not-italic text-good">→ n=12 · mean q=0.61 · banger rate 83%</em>
        <br />
        <br />
        <b>Cost:</b> ~$0.10–4 per backfill depending on model (Grok-4-fast is the cheap pass,
        Grok-4 is the accurate one)
      </>
    ),
    why: (
      <>
        <b>Why it matters.</b> Most "what should I post?" advice is generic. Archetypes grounded
        in <em className="not-italic">your own</em> scored history give you a small, concrete set
        of templates that already work for your account — and the avoid-list is just as valuable.
      </>
    ),
  },
];

export default function HowToUsePage() {
  return (
    <div className="max-w-[1320px] px-14 py-10">
      <PageHead
        eyebrow="manual"
        title="How to"
        highlight="use x/loop"
        sub="Three instruments, each tuned to one ranker behavior from the open-sourced For You algorithm. Read once, refer often."
      />
      <div className="grid gap-7 md:grid-cols-2">
        {CARDS.map((c) => (
          <article key={c.num} className="rounded-md border border-rule bg-panel p-8">
            <div className="mb-2 text-[14px] tracking-wider text-bad">{c.num}</div>
            <h2 className="mb-3.5 text-[32px] font-medium leading-tight tracking-tight text-ink">
              {c.title}
            </h2>
            <p className="mb-4 text-[15px] leading-snug text-ink">{c.def}</p>
            <div className="mb-4 rounded border border-dashed border-rule-strong bg-paper p-4 font-mono text-[11.5px] leading-relaxed text-ink-mute">
              {c.example}
            </div>
            <p className="border-t border-rule pt-3.5 text-[12.5px] leading-relaxed text-ink-mute">
              {c.why}
            </p>
          </article>
        ))}
      </div>
    </div>
  );
}
