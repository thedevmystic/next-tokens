/* Accent provider */

'use client';

import { createTokenProvider } from 'next-tokens';

/** All supported accent type */
export type Accent = 'terracotta' | 'sage' | 'slate' | 'amber';

/** Accent Provider */
const {
  Provider: AccentProvider,
  useToken: useAccent,
  context: accentContext,
} = createTokenProvider<Accent>({
  storageKey: 'accent',
  attribute: 'data-accent',
  tokens: ['terracotta', 'sage', 'slate', 'amber'],
  defaultToken: 'terracotta',
  enableSystem: false,
  enableColorScheme: false,
  skipScript: true,
});

export { AccentProvider, useAccent, accentContext };
