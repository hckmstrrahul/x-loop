import { PageHead } from '@/components/PageHead';

const ITEMS: Array<{ title: React.ReactNode; body: React.ReactNode }> = [
  {
    title: (
      <>
        Adversarial wording to bypass{' '}
        <code className="rounded bg-paper px-1.5 py-0.5 font-mono text-[12.5px] text-bad">
          safety_ptos
        </code>{' '}
        or the Banger screen
      </>
    ),
    body: 'Direct safety evasion. The classifiers exist for content the platform has decided not to amplify; routing around them is not a growth strategy, it\'s a violation.',
  },
  {
    title: 'Coordinated mute / block farms',
    body: 'Weaponizing the negative-weight side of the scorer against rivals is exactly what those weights are meant to penalize. Using them as a weapon is abuse — both technically and against people.',
  },
  {
    title: 'Botnets to inflate dwell / share_via_DM',
    body: 'The moment you simulate engagement, you\'re in TOS-and-legal territory. share_via_dm and dwell_time are the highest-leverage signals precisely because they\'re hard to fake. Trying to fake them is the line.',
  },
  {
    title: (
      <>
        "Evade{' '}
        <code className="rounded bg-paper px-1.5 py-0.5 font-mono text-[12.5px] text-bad">
          DO_NOT_AMPLIFY
        </code>
        "
      </>
    ),
    body: 'If your post earned that label, the answer is to write different posts — not to camouflage the existing ones. We won\'t help reverse-engineer the label criteria for evasion.',
  },
  {
    title: 'Coordinated bloom-filter manipulation',
    body: 'The impression bloom filter exists so you don\'t see the same post twice. Trying to game it across coordinated accounts to force re-impressions is abuse of a system designed for your own experience.',
  },
  {
    title: 'Scraping or impersonating the demographics / gender store',
    body: 'Server-side inferences about users are not creator-facing analytics. We don\'t fetch them, mirror them, or build tooling that depends on them. Out of scope, full stop.',
  },
];

export default function BoundariesPage() {
  return (
    <div className="max-w-[1320px] px-14 py-10">
      <PageHead
        eyebrow="red lines"
        title="What we"
        highlight="won't help with"
        sub="The same source code that exposes the dials also exposes the abuse surface. We're explicit about where the product stops."
      />
      <p className="mb-9 max-w-[720px] border-l-2 border-bad pl-6 text-[20px] leading-snug text-ink">
        Every signal in the For You ranker has a dual use. You can write a sharper post, or you can
        try to weaponize the scorer. x/loop is built for the first.
      </p>
      <div className="grid max-w-[880px] gap-3.5">
        {ITEMS.map((item, i) => (
          <div
            key={i}
            className="grid grid-cols-[56px_1fr] items-start gap-5 rounded border border-rule border-l-[3px] border-l-bad bg-panel p-6"
          >
            <div className="text-[28px] leading-none text-bad">✕</div>
            <div>
              <h4 className="mb-1.5 text-[15.5px] font-medium text-ink">{item.title}</h4>
              <p className="m-0 text-[13.5px] leading-relaxed text-ink-mute">{item.body}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
