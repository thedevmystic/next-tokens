/* Test: Standard theme switching */

'use client';

import { useTheme } from '@/providers/theme-provider';

export default function ThemeTestPage() {
  const { setToken } = useTheme();

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Standard Theme Test</h1>
      <button onClick={() => setToken('light')}>Light</button>
      <button onClick={() => setToken('dark')}>Dark</button>
      <button onClick={() => setToken('system')}>System</button>
    </div>
  );
}
