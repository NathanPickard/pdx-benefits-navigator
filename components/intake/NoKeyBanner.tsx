import Link from 'next/link';
import { KeyRound } from 'lucide-react';

import { useApiKey } from '@/lib/userKey';

export function NoKeyBanner() {
  const { apiKey, hydrated } = useApiKey();
  // Don't flash the banner on SSR / before hydration, or when key is already set
  if (!hydrated || apiKey) return null;

  return (
    <div
      className="rc-card rc-enter"
      style={{
        padding: '14px 18px',
        marginBottom: 20,
        background: 'var(--rose-soft)',
        borderColor: 'oklch(0.85 0.05 150)',
        display: 'flex',
        alignItems: 'flex-start',
        gap: 12,
      }}
    >
      <span
        style={{
          width: 30,
          height: 30,
          borderRadius: 999,
          background: 'var(--rose)',
          color: 'oklch(0.99 0.01 150)',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <KeyRound size={15} />
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontWeight: 600,
            fontSize: '0.95rem',
            color: 'var(--ink)',
            marginBottom: 2,
          }}
        >
          Bring your own Anthropic API key to get personalized results
        </div>
        <div
          style={{
            fontSize: '0.85rem',
            color: 'var(--ink-2)',
            lineHeight: 1.5,
          }}
        >
          Click the key indicator in the top right to paste yours. It&rsquo;s
          stored only in your browser — never sent to us. Or{' '}
          <Link
            href="/demo/maria"
            style={{
              color: 'oklch(0.40 0.10 150)',
              fontWeight: 600,
              textDecoration: 'underline',
            }}
          >
            try a demo first
          </Link>
          .
        </div>
      </div>
    </div>
  );
}
