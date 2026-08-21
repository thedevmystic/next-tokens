/* Checks if a component is mounted or not */

import { useSyncExternalStore } from 'react';

/**
 * Dummy subscription function.
 */
const emptySubscribe = () => () => {};

/**
 * Returns whether the component has mounted, or not.
 *
 * @returns boolean, indicating current mount status.
 */
export function useIsMounted() {
  return useSyncExternalStore(
    emptySubscribe,
    () => true, // Client value
    () => false, // Server (hydration) value
  );
}
