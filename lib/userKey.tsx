'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

const STORAGE_KEY = 'pdx_anthropic_key';

/** Bare localStorage helpers. Safe to call from client components. */
export function getStoredKey(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

export function setStoredKey(key: string): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, key);
    window.dispatchEvent(new CustomEvent('pdx-key-changed'));
  } catch {
    // localStorage may be disabled (private mode); silently skip
  }
}

export function clearStoredKey(): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
    window.dispatchEvent(new CustomEvent('pdx-key-changed'));
  } catch {
    // ignore
  }
}

/** Loose shape check — Anthropic keys look like `sk-ant-...` */
export function looksLikeAnthropicKey(value: string): boolean {
  return /^sk-ant-[A-Za-z0-9_-]{20,}$/.test(value.trim());
}

/* ──────────────────────────────────────────────────────────────────────
   React context — single source of truth for the key across the app.
   ──────────────────────────────────────────────────────────────────── */

interface ApiKeyState {
  /** The current key, or null if not set. */
  apiKey: string | null;
  /** True after hydration; false during SSR / first paint. */
  hydrated: boolean;
  /** Save a new key (persists to localStorage). */
  setKey: (key: string) => void;
  /** Wipe the key. */
  clearKey: () => void;
}

const ApiKeyContext = createContext<ApiKeyState | null>(null);

export function ApiKeyProvider({ children }: { children: React.ReactNode }) {
  const [apiKey, setApiKeyState] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  // Hydrate from localStorage on mount
  useEffect(() => {
    setApiKeyState(getStoredKey());
    setHydrated(true);

    // Sync across tabs + within tab when set/clear is called elsewhere
    const onChange = () => setApiKeyState(getStoredKey());
    window.addEventListener('storage', onChange);
    window.addEventListener('pdx-key-changed', onChange);
    return () => {
      window.removeEventListener('storage', onChange);
      window.removeEventListener('pdx-key-changed', onChange);
    };
  }, []);

  const setKey = useCallback((key: string) => {
    const trimmed = key.trim();
    setStoredKey(trimmed);
    setApiKeyState(trimmed);
  }, []);

  const clearKey = useCallback(() => {
    clearStoredKey();
    setApiKeyState(null);
  }, []);

  const value = useMemo<ApiKeyState>(
    () => ({ apiKey, hydrated, setKey, clearKey }),
    [apiKey, hydrated, setKey, clearKey]
  );

  return <ApiKeyContext.Provider value={value}>{children}</ApiKeyContext.Provider>;
}

export function useApiKey(): ApiKeyState {
  const ctx = useContext(ApiKeyContext);
  if (!ctx) {
    throw new Error('useApiKey must be used within <ApiKeyProvider>');
  }
  return ctx;
}
