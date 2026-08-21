/* Test: No System psuedo class */

'use client';

import { ThemeProvider, useTheme } from '@/providers/theme-provider';

function NoSystemContent() {
  const { tokens, setToken } = useTheme();

  return (
    <div style={{ padding: '2rem' }}>
      <h1>No-System Test</h1>
      {!tokens.includes('system' as any) && (
        <>
          <button onClick={() => setToken('light')}>Light</button>
          <button onClick={() => setToken('dark')}>Dark</button>
        </>
      )}
    </div>
  );
}

export default function NoSystemPage() {
  return (
    <ThemeProvider enableSystem={false}>
      <NoSystemContent />
    </ThemeProvider>
  );
}
