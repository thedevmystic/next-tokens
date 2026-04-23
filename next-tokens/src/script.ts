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
 * @path [ROOT]/next-tokens/src/script.ts
 * @file script.ts
 * @description Inline script to set the initial theme on the server to prevent
 *              FOUC due to React hydration delay.
 *
 * @author thedevmystic (Surya)
 * @copyright 2026-present Suryansh Singh Apache-2.0 License
 *
 * SPDX-FileCopyrightText: 2026-present Suryansh Singh
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Script to be injected as an inline <script> on the server to set the initial
 * theme before React hydration to avoid FOUC.
 */
export const script = (
  attribute: string | string[],
  storageKey: string,
  defaultToken: string,
  forcedToken: string | undefined,
  tokens: string[],
  value: Record<string, string> | undefined,
  enableSystem: boolean,
  enableColorScheme: boolean,
) => {
  const el = document.documentElement;
  const systemTokens = ['light', 'dark'];

  function updateDOM(token: string) {
    const attributes = Array.isArray(attribute) ? attribute : [attribute];

    attributes.forEach((attr) => {
      const isClass = attr === 'class';
      const classes = isClass && value ? tokens.map((t) => value[t] ?? t) : tokens;

      if (isClass) {
        el.classList.remove(...classes);
        el.classList.add(value?.[token] ?? token);
      } else {
        el.setAttribute(attr, value?.[token] ?? token);
      }
    });

    setColorScheme(token);
  }

  function setColorScheme(token: string) {
    if (enableColorScheme && systemTokens.includes(token)) {
      el.style.colorScheme = token;
    }
  }

  function getSystemToken(): string {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  if (forcedToken) {
    updateDOM(forcedToken);
  } else {
    try {
      const stored = localStorage.getItem(storageKey) ?? defaultToken;
      const resolved = enableSystem && stored === 'system' ? getSystemToken() : stored;
      updateDOM(resolved);
    } catch {
      // localStorage unavailable (SSR, private browsing, etc.)
      updateDOM(defaultToken);
    }
  }
};
