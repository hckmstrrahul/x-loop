import { buildModel, isValidModelId, isValidProvider, type ProviderId } from './providers';

/**
 * Extract BYOK credentials from a Request. Each visitor brings their own
 * provider + key + model — we hold them only for the lifetime of this
 * one request. Never logged, never persisted.
 *
 * Returns null with a reason if anything is missing or malformed.
 */
export function modelFromRequest(req: Request):
  | { ok: true; model: ReturnType<typeof buildModel>; provider: ProviderId }
  | { ok: false; reason: 'missing' | 'invalid_provider' | 'invalid_model' | 'invalid_key' } {
  const providerRaw = req.headers.get('x-llm-provider') ?? '';
  const modelRaw = req.headers.get('x-llm-model') ?? '';
  const keyRaw = req.headers.get('x-llm-key') ?? '';

  if (!providerRaw || !modelRaw || !keyRaw) {
    return { ok: false, reason: 'missing' };
  }
  if (!isValidProvider(providerRaw)) {
    return { ok: false, reason: 'invalid_provider' };
  }
  if (!isValidModelId(modelRaw)) {
    return { ok: false, reason: 'invalid_model' };
  }
  if (keyRaw.length < 8 || keyRaw.length > 256 || /[\s\r\n]/.test(keyRaw)) {
    return { ok: false, reason: 'invalid_key' };
  }

  try {
    const model = buildModel({ provider: providerRaw, apiKey: keyRaw, model: modelRaw });
    return { ok: true, model, provider: providerRaw };
  } catch {
    return { ok: false, reason: 'invalid_model' };
  }
}
