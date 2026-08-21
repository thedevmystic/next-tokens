/* Test: Multiple Providers with Accent Provider */

'use client';

import { useTheme } from '@/providers/theme-provider';
import { useAccent } from '@/providers/accent-provider';

export default function AccentTestPage() {
  const { setToken: setTheme } = useTheme();
  const { setToken: setAccent } = useAccent();

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Multi-Provider Test</h1>

      <div className="theme-controls">
        <button data-testid="theme-light" onClick={() => setTheme('light')}>
          Light Theme
        </button>
        <button data-testid="theme-dark" onClick={() => setTheme('dark')}>
          Dark Theme
        </button>
      </div>

      <div className="accent-controls" style={{ marginTop: '1rem' }}>
        <button data-testid="accent-terracotta" onClick={() => setAccent('terracotta')}>
          Terracotta Accent
        </button>
        <button data-testid="accent-sage" onClick={() => setAccent('sage')}>
          Sage Accent
        </button>
        <button data-testid="accent-slate" onClick={() => setAccent('slate')}>
          Slate Accent
        </button>
        <button data-testid="accent-amber" onClick={() => setAccent('amber')}>
          Amber Accent
        </button>
      </div>
    </div>
  );
}
