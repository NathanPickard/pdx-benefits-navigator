'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Check, ExternalLink, KeyRound, X } from 'lucide-react';

import { looksLikeAnthropicKey, useApiKey } from '@/lib/userKey';

/**
 * Combined AppBar key indicator + modal. The indicator is a small pill that
 * shows "Key set" (green) or "No key" (gray). Clicking it opens the modal.
 */
export function ApiKeyControl() {
  const { apiKey, hydrated, setKey, clearKey } = useApiKey();
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center"
        style={{
          gap: 6,
          padding: '5px 10px',
          borderRadius: 999,
          border: '1px solid var(--rule-2)',
          background: 'var(--paper-2)',
          color: 'var(--ink-2)',
          fontSize: '0.74rem',
          fontWeight: 600,
          cursor: 'pointer',
          whiteSpace: 'nowrap',
        }}
        aria-label="API key settings"
        title={apiKey ? 'API key is set' : 'No API key set'}
      >
        <span
          style={{
            width: 8,
            height: 8,
            borderRadius: 999,
            background: hydrated && apiKey ? 'var(--moss)' : 'var(--ink-4)',
            flexShrink: 0,
          }}
        />
        <KeyRound size={12} />
        <span className="rc-hide-sm">
          {hydrated && apiKey ? 'Key set' : 'No key'}
        </span>
      </button>

      {open && (
        <ApiKeyModal
          currentKey={apiKey}
          onSave={(k) => {
            setKey(k);
            setOpen(false);
          }}
          onClear={() => {
            clearKey();
            setOpen(false);
          }}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}

function ApiKeyModal({
  currentKey,
  onSave,
  onClear,
  onClose,
}: {
  currentKey: string | null;
  onSave: (key: string) => void;
  onClear: () => void;
  onClose: () => void;
}) {
  const [value, setValue] = useState(currentKey ?? '');
  const [error, setError] = useState<string | null>(null);

  // Close on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  // Lock body scroll while modal is open
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  const submit = () => {
    const trimmed = value.trim();
    if (!trimmed) {
      setError('Paste your Anthropic API key.');
      return;
    }
    if (!looksLikeAnthropicKey(trimmed)) {
      setError("That doesn't look like an Anthropic key — should start with sk-ant-…");
      return;
    }
    setError(null);
    onSave(trimmed);
  };

  if (typeof document === 'undefined') return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="apikey-modal-title"
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        background: 'oklch(0.25 0.03 230 / 0.45)',
        backdropFilter: 'blur(4px)',
        display: 'grid',
        placeItems: 'center',
        padding: 16,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="rc-card rc-enter"
        style={{
          width: '100%',
          maxWidth: 500,
          maxHeight: 'calc(100vh - 32px)',
          overflowY: 'auto',
          padding: 'clamp(20px, 4vw, 28px)',
          position: 'relative',
        }}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          style={{
            position: 'absolute',
            top: 14,
            right: 14,
            background: 'transparent',
            border: 0,
            cursor: 'pointer',
            color: 'var(--ink-3)',
            padding: 4,
            borderRadius: 8,
          }}
        >
          <X size={18} />
        </button>

        <div className="eyebrow mb-2" style={{ color: 'var(--moss-2)' }}>
          Bring your own key
        </div>
        <h2
          id="apikey-modal-title"
          className="font-display"
          style={{
            fontSize: '1.5rem',
            lineHeight: 1.15,
            margin: '0 0 10px',
            fontWeight: 500,
            letterSpacing: '-0.018em',
          }}
        >
          Your Anthropic API key
        </h2>
        <p
          style={{
            margin: '0 0 18px',
            fontSize: '0.92rem',
            lineHeight: 1.55,
            color: 'var(--ink-2)',
          }}
        >
          Personalized results call Claude directly from your browser using your
          own key. It&rsquo;s stored only in this browser&rsquo;s local storage —
          never sent to our server.
        </p>

        <label
          htmlFor="apikey-input"
          style={{
            display: 'block',
            fontSize: '0.86rem',
            fontWeight: 600,
            marginBottom: 6,
            color: 'var(--ink)',
          }}
        >
          API key
        </label>
        <input
          id="apikey-input"
          type="password"
          autoComplete="off"
          spellCheck={false}
          autoFocus
          className="rc-input tabular"
          placeholder="sk-ant-…"
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            if (error) setError(null);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') submit();
          }}
          style={{ fontFamily: 'var(--font-sans)' }}
        />
        {error && (
          <p
            style={{
              marginTop: 6,
              color: 'oklch(0.55 0.18 25)',
              fontSize: '0.82rem',
            }}
          >
            {error}
          </p>
        )}

        <p style={{ marginTop: 14, fontSize: '0.82rem', color: 'var(--ink-3)', lineHeight: 1.55 }}>
          Don&rsquo;t have one?{' '}
          <a
            href="https://console.anthropic.com/settings/keys"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: 'var(--rose)',
              fontWeight: 600,
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
            }}
          >
            Get one from console.anthropic.com
            <ExternalLink size={11} />
          </a>
        </p>

        <div
          className="flex items-center justify-between flex-wrap mt-6"
          style={{ gap: 10, marginTop: 24 }}
        >
          {currentKey ? (
            <button
              type="button"
              onClick={onClear}
              className="rc-btn rc-btn-ghost rc-btn-sm"
              style={{ color: 'var(--ink-3)' }}
            >
              Remove key
            </button>
          ) : (
            <span />
          )}
          <div className="flex items-center" style={{ gap: 8 }}>
            <button
              type="button"
              onClick={onClose}
              className="rc-btn rc-btn-outline rc-btn-sm"
            >
              Cancel
            </button>
            <button type="button" onClick={submit} className="rc-btn rc-btn-rose rc-btn-sm">
              <Check size={13} /> Save key
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
