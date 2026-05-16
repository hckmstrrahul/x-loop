'use client';

import { useCallback, useEffect, useState } from 'react';
import { PROVIDERS, type ProviderId } from './providers';

export type StoredKey = {
  provider: ProviderId;
  apiKey: string;
  model: string;
};

const STORAGE_KEY = 'xloop.byok.v1';

function read(): StoredKey | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<StoredKey>;
    if (
      parsed.provider &&
      parsed.apiKey &&
      parsed.model &&
      Object.keys(PROVIDERS).includes(parsed.provider)
    ) {
      return parsed as StoredKey;
    }
  } catch {
    /* ignore */
  }
  return null;
}

function write(value: StoredKey | null) {
  if (typeof window === 'undefined') return;
  try {
    if (value === null) {
      window.localStorage.removeItem(STORAGE_KEY);
    } else {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
    }
    // notify other components on this tab
    window.dispatchEvent(new Event('xloop:key-changed'));
  } catch {
    /* ignore quota / privacy errors */
  }
}

export function useApiKey() {
  const [stored, setStored] = useState<StoredKey | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setStored(read());
    setHydrated(true);
    const onChange = () => setStored(read());
    window.addEventListener('xloop:key-changed', onChange);
    window.addEventListener('storage', onChange);
    return () => {
      window.removeEventListener('xloop:key-changed', onChange);
      window.removeEventListener('storage', onChange);
    };
  }, []);

  const save = useCallback((value: StoredKey) => {
    write(value);
    setStored(value);
  }, []);

  const clear = useCallback(() => {
    write(null);
    setStored(null);
  }, []);

  return { key: stored, save, clear, hydrated };
}

/**
 * Build the headers used to attach a BYOK to a fetch() request.
 * Caller checks `key` is set before invoking.
 */
export function authHeaders(key: StoredKey): Record<string, string> {
  return {
    'x-llm-provider': key.provider,
    'x-llm-model': key.model,
    'x-llm-key': key.apiKey,
  };
}
