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
 * @path [ROOT]/next-tokens/src/types.ts
 * @file types.ts
 * @description Types for token provider.
 *
 * @author thedevmystic (Surya)
 * @copyright 2026-present Suryansh Singh Apache-2.0 License
 *
 * SPDX-FileCopyrightText: 2026-present Suryansh Singh
 * SPDX-License-Identifier: Apache-2.0
 */

import type { ReactNode, ComponentPropsWithoutRef, Context } from 'react';

/**
 * A mapping of token names to attribute values.
 */
interface ValueObject {
  [tokenName: string]: string;
}

/**
 * A string literal type for data-* attributes, e.g. 'data-theme' or 'data-accent'.
 */
type DataAttribute = `data-${string}`;

/**
 * Props forwarded to the inline hydration <script> tag.
 */
export interface ScriptProps extends ComponentPropsWithoutRef<'script'> {
  [dataAttribute: DataAttribute]: unknown;
}

/**
 * The type of the setToken function returned by the hook.
 */
export type TokenSetter<T extends string> = (value: T | ((prev: T) => T)) => void;

/**
 * The shape of the object returned by the useToken hook.
 */
export interface UseTokenProps<T extends string = string> {
  /** All available token values for this provider instance */
  tokens: T[];
  /** The active token value */
  token?: T | undefined;
  /** Resolved token value after considering forcedToken and system preference */
  resolvedToken?: T | undefined;
  /** When forcedToken is set on the page, this holds that value */
  forcedToken?: T | undefined;
  /** Only defined when enableSystem is true — the raw OS color-scheme */
  systemToken?: 'light' | 'dark' | undefined;
  /** Function to update the token value */
  setToken: TokenSetter<T>;
  /** @internal — register/unregister a forced override from a nested provider */
  _registerForced?: (token: T) => void;
  _unregisterForced?: () => void;
  /** @internal — currently active forced override, if any */
  _forcedOverride?: string;
}

/**
 * The type of the `attribute` prop on the provider.
 * Accepts 'class' or any 'data-*' string, or an array of both.
 */
export type Attribute = DataAttribute | 'class';

/**
 * Props for the TokenProvider component.
 */
export interface TokenProviderProps<T extends string = string> {
  /** The content of the provider */
  children?: ReactNode;
  /** All valid token values */
  tokens?: T[];
  /** Force a specific token on this subtree, ignoring user preference */
  forcedToken?: T;
  /** Follow the OS prefers-color-scheme and expose a 'system' pseudo-token. */
  enableSystem?: boolean;
  /** Reflect the active color scheme to the browser for native UI. */
  enableColorScheme?: boolean;
  /** Suppress CSS transitions while the token is being swapped. Default: false */
  disableTransitionOnChange?: boolean;
  /** localStorage key. Must be unique per provider instance. */
  storageKey?: string;
  /** Initial token when nothing is stored. */
  defaultToken?: T | 'system';
  /** The HTML attribute (or array of attributes) written to <html>. */
  attribute?: Attribute | Attribute[];
  /** Remap token names to attribute values */
  value?: ValueObject;
  /** CSP nonce forwarded to the inline hydration script */
  nonce?: string;
  /** Extra props forwarded to the inline <script> tag */
  scriptProps?: ScriptProps;
}

/**
 * Token provider factory return type, containing the provider component,
 * the hook, and the raw context.
 */
export interface TokenProviderFactory<T extends string = string> {
  /** The pre-configured provider component. */
  Provider: (props: Partial<TokenProviderProps<T>>) => ReactNode;
  /** Hook scoped to this provider instance */
  useToken: () => UseTokenProps<T>;
  /** The raw React context object. */
  context: Context<UseTokenProps<T> | undefined>;
}
