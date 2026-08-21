/* Batched provider scripts */

import { BatchedTokenScript } from 'next-tokens';

export const BatchScript = ({ nonce }: { nonce: string }) => {
  return (
    <BatchedTokenScript
      nonce={nonce}
      instances={[
        {
          storageKey: 'theme',
          attribute: 'data-theme',
          tokens: ['light', 'dark'],
          defaultToken: 'system',
          enableSystem: true,
          enableColorScheme: true,
        },
        {
          storageKey: 'accent',
          attribute: 'data-accent',
          tokens: ['blue', 'purple', 'amber'],
          defaultToken: 'blue',
          enableSystem: false,
          enableColorScheme: false,
        },
      ]}
    />
  );
};
