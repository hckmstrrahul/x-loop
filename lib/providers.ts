import { createAnthropic } from '@ai-sdk/anthropic';
import { createOpenAI } from '@ai-sdk/openai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { createXai } from '@ai-sdk/xai';

export type ProviderId = 'xai' | 'anthropic' | 'openai' | 'google';

export type ProviderInfo = {
  id: ProviderId;
  label: string;
  short: string;
  blurb: string;
  recommended: boolean;
  models: string[];
  defaultModel: string;
  keyHint: string;
  keyPrefix: string;
  signupUrl: string;
};

export const PROVIDERS: Record<ProviderId, ProviderInfo> = {
  xai: {
    id: 'xai',
    label: 'Grok',
    short: 'xAI',
    blurb:
      "Recommended. Grok is xAI's model — the same family X uses to run its real Banger classifier in production. The closest match to live scoring you'll get.",
    recommended: true,
    models: ['grok-4', 'grok-4-fast', 'grok-3', 'grok-3-mini'],
    defaultModel: 'grok-4',
    keyHint: 'xai-...',
    keyPrefix: 'xai-',
    signupUrl: 'https://console.x.ai/',
  },
  anthropic: {
    id: 'anthropic',
    label: 'Claude',
    short: 'Anthropic',
    blurb:
      'Strong general-purpose reasoning. More conservative than Grok on the slop and minor-flag axes — useful if Grok feels too harsh on your drafts.',
    recommended: false,
    models: ['claude-sonnet-4-6', 'claude-opus-4-7', 'claude-haiku-4-5'],
    defaultModel: 'claude-sonnet-4-6',
    keyHint: 'sk-ant-...',
    keyPrefix: 'sk-ant-',
    signupUrl: 'https://console.anthropic.com/',
  },
  openai: {
    id: 'openai',
    label: 'GPT',
    short: 'OpenAI',
    blurb:
      'Reliable outputs. Tends to rate posts as less sloppy than Grok — try this if Grok keeps rejecting drafts you think are fine.',
    recommended: false,
    models: ['gpt-5', 'gpt-5-mini', 'gpt-4.1', 'gpt-4o'],
    defaultModel: 'gpt-5',
    keyHint: 'sk-...',
    keyPrefix: 'sk-',
    signupUrl: 'https://platform.openai.com/api-keys',
  },
  google: {
    id: 'google',
    label: 'Gemini',
    short: 'Google',
    blurb:
      'Fast and cheap. Solid baseline; calibration is looser than Grok or Claude. Good for high-volume backfill scoring.',
    recommended: false,
    models: ['gemini-2.5-pro', 'gemini-2.5-flash', 'gemini-2.0-flash'],
    defaultModel: 'gemini-2.5-pro',
    keyHint: 'AIza...',
    keyPrefix: 'AIza',
    signupUrl: 'https://aistudio.google.com/apikey',
  },
};

export const PROVIDER_IDS: ProviderId[] = ['xai', 'anthropic', 'openai', 'google'];

// Validate a model id — alphanumeric, dots, hyphens, underscores only, max 64 chars.
// Defensive: user-controlled strings end up as a model id sent to the provider SDK.
const MODEL_RE = /^[a-zA-Z0-9._\-:/]{1,64}$/;

export function isValidModelId(s: string): boolean {
  return MODEL_RE.test(s);
}

export function isValidProvider(s: string): s is ProviderId {
  return PROVIDER_IDS.includes(s as ProviderId);
}

/**
 * Build a model instance from a user-supplied API key.
 *
 * The key is held only on the stack frame of this call; it is not
 * persisted, logged, or echoed back. Caller is responsible for not
 * exposing the key in any other path (no logging the headers).
 */
export function buildModel(args: { provider: ProviderId; apiKey: string; model: string }) {
  const { provider, apiKey, model } = args;
  if (!isValidModelId(model)) {
    throw new Error('invalid_model');
  }
  switch (provider) {
    case 'xai':
      return createXai({ apiKey })(model);
    case 'anthropic':
      return createAnthropic({ apiKey })(model);
    case 'openai':
      return createOpenAI({ apiKey })(model);
    case 'google':
      return createGoogleGenerativeAI({ apiKey })(model);
  }
}
