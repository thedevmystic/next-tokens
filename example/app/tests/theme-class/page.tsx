/* Test: Theme switching with class */

'use client';

import { createTokenProvider } from 'next-tokens';

type ThemeClass = 'light' | 'dark' | 'system';

const { Provider: ThemeClassProvider, useToken: useThemeClass } = createTokenProvider<ThemeClass>({
  storageKey: 'theme-class',
  attribute: 'class',
  defaultToken: 'system',
  tokens: ['light', 'dark'],
});

function ThemeClassTestContent() {
  const { setToken, token } = useThemeClass();

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Class Attribute Test</h1>
      <p>
        Current Theme Class: <strong data-testid="current-theme">{token}</strong>
      </p>
      <button data-testid="theme-light" onClick={() => setToken('light')}>
        Light
      </button>
      <button data-testid="theme-dark" onClick={() => setToken('dark')}>
        Dark
      </button>
      <button data-testid="theme-system" onClick={() => setToken('system')}>
        System
      </button>
    </div>
  );
}

export default function ThemeClassTestPage() {
  return (
    <ThemeClassProvider>
      <ThemeClassTestContent />
    </ThemeClassProvider>
  );
}
