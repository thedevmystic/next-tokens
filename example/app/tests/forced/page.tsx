/* Test: Forced Token */

'use client';

import { ThemeProvider } from '@/providers/theme-provider';

export default function ForcedTestPage() {
  return (
    <ThemeProvider forcedToken="dark">
      <div style={{ padding: '2rem' }}>
        <h1>Forced Dark Theme</h1>
        <p>This page should always be dark regardless of settings.</p>
      </div>
    </ThemeProvider>
  );
}
