/**
 * Copyright 2026-present Suryansh Singh
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * ------------------------------------------------------------------------------------------------------
 *
 * @path [ROOT]/next-tokens/src/index.tsx
 * @file index.tsx
 * @description Multi-instance token provider. A modern library built to support
 *              multiple independent providers (theme, accent, lang, etc.)
 *              with per-key React contexts and typed hook aliases.
 *
 * @author thedevmystic (Surya)
 * @copyright 2026-present Suryansh Singh Apache-2.0 License
 *
 * SPDX-FileCopyrightText: 2026-present Suryansh Singh
 * SPDX-License-Identifier: Apache-2.0
 */

'use client';

import type { Context } from 'react';
import {
  createContext,
  useContext,
  useEffect,
  useState,
  useSyncExternalStore,
  useCallback,
  useMemo,
  memo,
} from 'react';
import { preinit } from 'react-dom';

import type {
  Attribute,
  ScriptProps,
  TokenProviderFactory,
  TokenProviderProps,
  TokenSetter,
  UseTokenProps,
} from './types';
import { script } from './script';

/**
 * Constant colorscheme values and media query.
 */
const COLOR_SCHEMES = ['light', 'dark'] as const;
const MEDIA = '(prefers-color-scheme: dark)';

/**
 * Internal registry of contexts stored by primary key as storageKey.
 */
type AnyTokenContext = Context<UseTokenProps<string> | undefined>;
const registry = new Map<string, AnyTokenContext>();

/**
 * Retrieves the context for a given key, creating it if it doesn't exist.
 */
function getOrCreateContext(key: string): AnyTokenContext {
  if (!registry.has(key)) {
    registry.set(key, createContext<UseTokenProps<string> | undefined>(undefined));
  }
  return registry.get(key)!;
}

/**
 * No-op setter and empty values to prevent crashes when useToken is used outside
 * of a provider.
 */
const emptySet: TokenSetter<string> = () => {};
const defaultValue: UseTokenProps<string> = {
  setToken: emptySet,
  tokens: [],
  token: undefined,
  resolvedToken: undefined,
};

/**
 * Low-level hook. Reads the provider registered under storageKey.
 */
export function useToken<T extends string = string>(storageKey = 'token'): UseTokenProps<T> {
  const ctx = getOrCreateContext(storageKey);
  return (useContext(ctx) ?? (defaultValue as unknown)) as UseTokenProps<T>;
}

/**
 * Produces a pre-bound, correctly typed hook alias for a storageKey.
 */
export function makeTokenHook<T extends string>(storageKey: string): () => UseTokenProps<T> {
  return function useTokenAlias() {
    return useToken<T>(storageKey);
  };
}

/**
 * Multi-instance token provider. Wrapping the same storageKey twice is a no-op.
 *
 * @param {TokenProviderProps} props - The provider props.
 * @returns {JSX.Element} The provider component.
 * @see createTokenProvider for a factory that returns a pre-configured Provider
 *                          and hook alias.
 */
export function TokenProvider<T extends string = string>(props: TokenProviderProps<T>) {
  return <TokenImpl {...props} />;
}

/**
 * Factory for creating a token provider with pre-bound defaults and a typed hook.
 *
 * @param {Partial<TokenProviderProps>} defaults - Default props for the provider.
 * @returns {TokenProviderFactory} An object containing the Provider component,
 *          a useToken hook pre-bound to the storageKey, and the raw context.
 */
export function createTokenProvider<T extends string>(
  defaults: Partial<TokenProviderProps<T>> & { storageKey: string },
): TokenProviderFactory<T> {
  /** The Provider component merges the factory defaults with any props passed. */
  const Provider = (props: Partial<TokenProviderProps<T>>) => (
    <TokenProvider<T> {...defaults} {...props} />
  );

  Provider.displayName = `TokenProvider(${defaults.storageKey})`;

  /** A typed hook pre-bound to the factory's storageKey. */
  const useToken = makeTokenHook<T>(defaults.storageKey);
  /** The raw context is exposed to for use(Context). */
  const context = getOrCreateContext(defaults.storageKey) as Context<UseTokenProps<T> | undefined>;

  return {
    Provider,
    useToken,
    context,
  };
}

/**
 * Hook to check if the component is mounted. Used to avoid hydration mismatches.
 */
const emptySubscribe = () => () => {};
function useIsMounted(): boolean {
  return useSyncExternalStore(
    emptySubscribe,
    () => true, // Client Value
    () => false, // Server Value
  );
}

/**
 * Saves a value to localStorage, doing nothing on failure.
 */
function saveToStorage(key: string, value: string): void {
  try {
    localStorage.setItem(key, value);
  } catch {
    // Error
  }
}

/**
 * Reads a value from localStorage, returning undefined on failure or if not found.
 */
function readFromStorage(key: string): string | undefined {
  try {
    return localStorage.getItem(key) ?? undefined;
  } catch {
    return undefined;
  }
}

/**
 * Reads the system preference using matchMedia. Returns 'light' if unavailable.
 */
function getSystemToken(): 'light' | 'dark' {
  return window.matchMedia(MEDIA).matches ? 'dark' : 'light';
}

/**
 * Injects a style tag to disable all transitions, returning a cleanup function.
 */
function disableAnimation(nonce?: string): () => void {
  const style = document.createElement('style');
  if (nonce) style.setAttribute('nonce', nonce);
  style.textContent = '*,*::before,*::after{transition:none!important}';
  document.head.appendChild(style);
  return () => {
    // Force a synchronous restyle flush so the transition suppression takes
    // effect before we remove the style tag on the next tick
    window.getComputedStyle(document.body).opacity;
    setTimeout(() => document.head.removeChild(style), 1);
  };
}

/**
 * Default token list used for class and data attribute.
 */
const defaultTokenList = ['light', 'dark'];

/**
 * Private implementation of the TokenProvider. Handles state management,
 * DOM updates, etc.
 *
 * @see TokenProvider for the public API and prop documentation.
 */
function TokenImpl<T extends string>({
  forcedToken,
  disableTransitionOnChange = false,
  enableSystem = true,
  enableColorScheme = true,
  storageKey = 'token',
  tokens = defaultTokenList as unknown as T[],
  defaultToken = (enableSystem ? 'system' : tokens[0]) as T,
  attribute = 'data-token',
  value,
  children,
  nonce,
  scriptProps,
}: TokenProviderProps<T>) {
  /** Check if the component is mounted to avoid hydration mismatches. */
  const isMounted = useIsMounted();

  /**
   * Active token value.
   * Pre-hydration: always defaultToken.
   * Post-hydration: localStorage value if present, otherwise defaultToken.
   */
  const [token, setTokenState] = useState<T>(defaultToken as T);

  /** Get context */
  const Ctx = getOrCreateContext(storageKey);

  /** Get parent value to support nested providers. */
  const parent = useContext(Ctx) as UseTokenProps<T> | undefined;

  /** Determine if it's root. */
  const isRoot = parent === undefined;

  /** Forced child tracking */
  const [forcedOverride, setForcedOverride] = useState<T | undefined>(undefined);
  /** Register/unregister functions for children to override the token. */
  const registerForced = useCallback((token: T) => setForcedOverride(token), []);
  const unregisterForced = useCallback(() => setForcedOverride(undefined), []);

  /** Set on mount */
  useEffect(() => {
    if (!isMounted || forcedToken) {
      setTokenState(defaultToken as T);
    }
    const stored = readFromStorage(storageKey);
    setTokenState((stored ?? defaultToken) as T);
  }, [isMounted, storageKey, defaultToken, forcedToken]);

  /** Cross-tab sync */
  useEffect(() => {
    if (forcedToken) return;
    const handler = (e: StorageEvent) => {
      if (e.key !== storageKey) return;
      setTokenState((e.newValue ?? defaultToken) as T);
    };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, [storageKey, defaultToken]);

  /** System preference sync */
  const [systemToken, setSystemToken] = useState<'light' | 'dark'>('light');

  /** Listen for changes to the system preference and update systemToken. */
  useEffect(() => {
    if (!isMounted) return;
    setSystemToken(getSystemToken());

    const media = window.matchMedia(MEDIA);
    const handler = (e: MediaQueryListEvent) => {
      setSystemToken(e.matches ? 'dark' : 'light');
    };
    media.addEventListener('change', handler);
    return () => media.removeEventListener('change', handler);
  }, [isMounted]);

  /** DOM Attribute application */
  const attrs = useMemo(
    () => (value ? Object.values(value) : (tokens as string[])),
    [value, tokens],
  );

  const applyToken = useCallback(
    (raw: T | 'system') => {
      const resolved: string =
        raw === 'system' && enableSystem ? getSystemToken() : (raw as string);

      const mapped = value?.[resolved] ?? resolved;
      const reenable = disableTransitionOnChange ? disableAnimation(nonce) : null;
      const root = document.documentElement;

      const applyAttr = (attr: Attribute) => {
        if (attr === 'class') {
          root.classList.remove(...attrs);
          if (mapped) root.classList.add(mapped);
        } else if (attr.startsWith('data-')) {
          mapped ? root.setAttribute(attr, mapped) : root.removeAttribute(attr);
        }
      };

      Array.isArray(attribute) ? attribute.forEach(applyAttr) : applyAttr(attribute);

      if (enableColorScheme) {
        const fallback = COLOR_SCHEMES.includes(defaultToken as never)
          ? (defaultToken as string)
          : null;
        const scheme = COLOR_SCHEMES.includes(resolved as never) ? resolved : fallback;
        root.style.colorScheme = scheme ?? '';
      }

      reenable?.();
    },
    [
      attribute,
      attrs,
      value,
      enableSystem,
      enableColorScheme,
      disableTransitionOnChange,
      nonce,
      defaultToken,
    ],
  );

  /** Nested provider registration */
  useEffect(() => {
    if (!isMounted) return;
    if (!forcedToken || !parent?._registerForced) return;
    parent?._registerForced(forcedToken as T);
    return () => parent?._unregisterForced?.();
  }, [isMounted, forcedToken, parent]);

  /** Apply the token on mount and whenever it changes. */
  useEffect(() => {
    if (!isMounted) return;
    if (isRoot && forcedOverride) return;
    applyToken(forcedToken ?? token);
  }, [isMounted, isRoot, forcedToken, forcedOverride, token, systemToken, applyToken]);

  /**
   * Token setter that updates state and localStorage.
   * Accepts either a value or an updater function.
   */
  const setToken: TokenSetter<T> = useCallback(
    (update) => {
      if (forcedToken) return;
      const next = typeof update === 'function' ? update(token) : update;
      saveToStorage(storageKey, next);
      if (!(isRoot && forcedOverride)) {
        applyToken(next as T);
      }
      setTokenState(next as T);
    },
    [storageKey, token, forcedToken, isRoot, forcedOverride, applyToken],
  );

  const frozenSetToken: TokenSetter<T> = useCallback(() => {}, []);

  /** The token to apply, resolving 'system' if necessary. */
  const resolvedToken = useMemo(() => {
    if (forcedToken) return forcedToken;
    if (token === 'system' && enableSystem) return systemToken;
    return token;
  }, [forcedToken, token, systemToken, enableSystem]) as T;

  const contextValue = useMemo<UseTokenProps<T>>(
    () => ({
      ...parent,
      token: forcedToken ? (forcedToken as T) : token,
      setToken: forcedToken ? frozenSetToken : setToken,
      forcedToken: forcedToken as T | undefined,
      resolvedToken: forcedToken ? (forcedToken as T) : resolvedToken,
      tokens: enableSystem ? ([...tokens, 'system'] as T[]) : tokens,
      systemToken: enableSystem ? systemToken : undefined,
      ...(isRoot && {
        _registerForced: registerForced,
        _unregisterForced: unregisterForced,
        _forcedOverride: forcedOverride,
      }),
    }),
    [
      parent,
      token,
      frozenSetToken,
      setToken,
      forcedToken,
      resolvedToken,
      enableSystem,
      systemToken,
      tokens,
      isRoot,
      registerForced,
      unregisterForced,
      forcedOverride,
    ],
  );

  return (
    <Ctx.Provider value={contextValue as unknown as UseTokenProps<string>}>
      <TokenScript
        forcedToken={forcedToken as string | undefined}
        storageKey={storageKey}
        attribute={attribute}
        enableSystem={enableSystem}
        enableColorScheme={enableColorScheme}
        defaultToken={defaultToken as string}
        value={value}
        tokens={tokens as string[]}
        nonce={nonce}
        scriptProps={scriptProps}
      />
      {children}
    </Ctx.Provider>
  );
}

/**
 * Props for the TokenScript component.
 */
interface TokenScriptProps {
  forcedToken?: string;
  storageKey: string;
  attribute: Attribute | Attribute[];
  enableSystem: boolean;
  enableColorScheme: boolean;
  defaultToken: string;
  value?: Record<string, string>;
  tokens: string[];
  nonce?: string;
  scriptProps?: ScriptProps;
}

/**
 * A script component that injects the token-setting script into the document head.
 * This ensures that the correct token is applied as early as possible, preventing
 * flashes of incorrect styles on initial load.
 */
export const TokenScript = memo(function TokenScript({
  forcedToken,
  storageKey,
  attribute,
  enableSystem,
  enableColorScheme,
  defaultToken,
  value,
  tokens,
  nonce,
  scriptProps,
}: TokenScriptProps) {
  const args = JSON.stringify([
    attribute,
    storageKey,
    defaultToken,
    forcedToken,
    tokens,
    value,
    enableSystem,
    enableColorScheme,
  ]).slice(1, -1);

  const scriptContent = `(${script.toString()})(${args})`;
  const scriptURI = `data:text/javascript,${encodeURIComponent(scriptContent)}`;

  preinit(scriptURI, {
    as: 'script',
    nonce: nonce || '',
    async: false,
    defer: false,
    ...scriptProps,
  });

  return null; // This component does not render anything itself
});

/** Re-export types for external use. */
export type { Attribute, TokenProviderFactory, TokenProviderProps, TokenSetter, UseTokenProps };
