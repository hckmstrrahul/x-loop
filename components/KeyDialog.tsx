'use client';

import { useEffect, useRef, useState } from 'react';
import { PROVIDERS, PROVIDER_IDS, type ProviderId } from '@/lib/providers';
import { useApiKey } from '@/lib/use-api-key';

export function KeyDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { key, save, clear } = useApiKey();
  const [provider, setProvider] = useState<ProviderId>(key?.provider ?? 'xai');
  const [apiKey, setApiKeyVal] = useState(key?.apiKey ?? '');
  const [model, setModel] = useState(key?.model ?? PROVIDERS.xai.defaultModel);
  const [showKey, setShowKey] = useState(false);
  const [customModel, setCustomModel] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      setProvider(key?.provider ?? 'xai');
      setApiKeyVal(key?.apiKey ?? '');
      setModel(key?.model ?? PROVIDERS[key?.provider ?? 'xai'].defaultModel);
      setShowKey(false);
      setCustomModel(false);
    }
  }, [open, key]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  const info = PROVIDERS[provider];

  function switchProvider(p: ProviderId) {
    setProvider(p);
    if (!key || key.provider !== p) {
      setModel(PROVIDERS[p].defaultModel);
      setCustomModel(false);
    }
  }

  function onSave() {
    if (!apiKey.trim()) return;
    save({ provider, apiKey: apiKey.trim(), model: model.trim() });
    onClose();
  }

  return (
    <div
      onClick={(e) => {
        if (e.target === dialogRef.current) onClose();
      }}
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-ink/40 p-6 backdrop-blur-sm"
      ref={dialogRef}
    >
      <div className="mt-12 w-full max-w-2xl rounded-md border border-rule bg-panel shadow-[0_24px_60px_-20px_rgba(0,0,0,0.25)]">
        <div className="flex items-center justify-between border-b border-rule px-7 py-5">
          <div>
            <div className="mb-1 font-mono text-[10px] uppercase tracking-[0.22em] text-bad">
              api key setup
            </div>
            <h2 className="text-2xl font-medium leading-none tracking-tight text-ink">
              Choose a model
            </h2>
          </div>
          <button
            onClick={onClose}
            className="rounded p-2 text-ink-mute transition hover:bg-paper-2 hover:text-ink"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div className="space-y-5 px-7 py-6">
          <div className="rounded border border-rule bg-paper-2 px-4 py-3 text-[12.5px] leading-relaxed text-ink-mute">
            Your key is stored only in <span className="font-medium text-ink">this browser's
            localStorage</span> and is sent directly to the model provider through a thin proxy on
            this site. The server never logs it, never persists it, and never has access between
            requests. Clear it anytime.
          </div>

          {/* provider tabs */}
          <div>
            <label className="mb-2 block font-mono text-[10px] uppercase tracking-[0.22em] text-ink-mute">
              provider
            </label>
            <div className="grid grid-cols-4 gap-2">
              {PROVIDER_IDS.map((p) => {
                const pi = PROVIDERS[p];
                const active = provider === p;
                return (
                  <button
                    key={p}
                    onClick={() => switchProvider(p)}
                    className={`relative rounded-md border px-3 py-3 text-left transition ${
                      active
                        ? 'border-ink bg-paper-2'
                        : 'border-rule hover:border-rule-strong hover:bg-paper-2'
                    }`}
                  >
                    {pi.recommended && (
                      <span className="absolute -top-1.5 right-2 rounded-full bg-bad px-1.5 py-0.5 font-mono text-[8px] uppercase tracking-wider text-paper">
                        rec
                      </span>
                    )}
                    <div className="text-[14.5px] font-medium text-ink">{pi.label}</div>
                    <div className="font-mono text-[10px] uppercase tracking-wider text-ink-mute">
                      {pi.short}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* provider blurb */}
          <div
            className={`rounded border bg-panel px-4 py-3 text-[13px] leading-snug ${
              info.recommended ? 'border-l-[3px] border-l-bad border-rule' : 'border-rule'
            }`}
          >
            <span className={info.recommended ? 'text-ink' : 'text-ink-mute'}>{info.blurb}</span>
          </div>

          {/* key input */}
          <div>
            <label className="mb-2 flex items-baseline justify-between font-mono text-[10px] uppercase tracking-[0.22em] text-ink-mute">
              <span>{info.label} api key</span>
              <a
                href={info.signupUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-[10px] uppercase tracking-wider text-ink transition hover:text-bad"
              >
                get a key ↗
              </a>
            </label>
            <div className="flex gap-2">
              <input
                type={showKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => setApiKeyVal(e.target.value)}
                placeholder={info.keyHint}
                autoComplete="off"
                spellCheck={false}
                className="flex-1 rounded border border-rule-strong bg-paper px-3.5 py-2.5 font-mono text-[14px] text-ink outline-none transition focus:border-bad"
              />
              <button
                onClick={() => setShowKey((v) => !v)}
                type="button"
                className="rounded border border-rule-strong bg-panel px-3 text-[12px] text-ink-mute transition hover:bg-paper-2 hover:text-ink"
              >
                {showKey ? 'hide' : 'show'}
              </button>
            </div>
          </div>

          {/* model selector */}
          <div>
            <label className="mb-2 block font-mono text-[10px] uppercase tracking-[0.22em] text-ink-mute">
              model
            </label>
            {customModel ? (
              <div className="flex gap-2">
                <input
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className="flex-1 rounded border border-rule-strong bg-paper px-3.5 py-2.5 font-mono text-[14px] text-ink outline-none transition focus:border-bad"
                  placeholder="e.g. grok-4-fast"
                />
                <button
                  onClick={() => {
                    setCustomModel(false);
                    setModel(info.defaultModel);
                  }}
                  className="rounded border border-rule-strong bg-panel px-3 text-[12px] text-ink-mute transition hover:bg-paper-2 hover:text-ink"
                >
                  preset
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <select
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className="flex-1 rounded border border-rule-strong bg-paper px-3.5 py-2.5 font-mono text-[14px] text-ink outline-none transition focus:border-bad"
                >
                  {info.models.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => setCustomModel(true)}
                  className="rounded border border-rule-strong bg-panel px-3 text-[12px] text-ink-mute transition hover:bg-paper-2 hover:text-ink"
                >
                  custom
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-rule bg-paper-2 px-7 py-4">
          <button
            onClick={() => {
              clear();
              onClose();
            }}
            className="text-[12.5px] text-ink-mute transition hover:text-bad"
          >
            Clear stored key
          </button>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="rounded border border-rule-strong bg-panel px-4 py-2 text-[13px] text-ink-mute transition hover:bg-paper-2 hover:text-ink"
            >
              Cancel
            </button>
            <button
              onClick={onSave}
              disabled={!apiKey.trim()}
              className="rounded border border-ink bg-ink px-4 py-2 text-[13px] font-medium text-paper transition hover:opacity-90 disabled:opacity-40"
            >
              Save key
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
