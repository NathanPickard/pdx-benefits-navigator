'use client';

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
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

/**
 * Subscribe to key changes: cross-tab `storage` events plus the in-tab
 * `pdx-key-changed` custom event dispatched by set/clear.
 */
function subscribeKey(onChange: () => void): () => void {
  if (typeof window === 'undefined') return () => {};
  window.addEventListener('storage', onChange);
  window.addEventListener('pdx-key-changed', onChange);
  return () => {
    window.removeEventListener('storage', onChange);
    window.removeEventListener('pdx-key-changed', onChange);
  };
}

/** No-op subscribe for the hydration flag — the value never changes after mount. */
const noopSubscribe = () => () => {};

export function ApiKeyProvider({ children }: { children: React.ReactNode }) {
  // Read the key straight from localStorage as an external store. The server
  // snapshot (and first client render) is null to match SSR, then React
  // re-renders with the real value — no setState-in-effect needed.
  const apiKey = useSyncExternalStore(subscribeKey, getStoredKey, () => null);

  // False on the server + first client render, true once hydrated. Lets
  // consumers avoid flashing "no key" UI before localStorage has been read.
  const hydrated = useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false
  );

  // set/clear write to localStorage and dispatch `pdx-key-changed`, which the
  // subscription above picks up to re-render with the new value.
  const setKey = useCallback((key: string) => {
    setStoredKey(key.trim());
  }, []);

  const clearKey = useCallback(() => {
    clearStoredKey();
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
