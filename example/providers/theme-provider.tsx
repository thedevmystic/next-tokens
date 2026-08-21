/* Theme provider */

'use client';

import { createTokenProvider } from 'next-tokens';

/** All supported theme tokens. */
export type Theme = 'light' | 'dark' | 'system';

/** Theme Provider */
const {
  Provider: ThemeProvider,
  useToken: useTheme,
  context: themeContext,
} = createTokenProvider<Theme>({
  storageKey: 'theme',
  attribute: 'data-theme',
  defaultToken: 'system',
  enableSystem: true,
  enableColorScheme: true,
  tokens: ['light', 'dark'],
  disableTransitionOnChange: false,
  skipScript: true,
});

export { ThemeProvider, useTheme, themeContext };
