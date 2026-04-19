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
 * @path [ROOT]/next-tokens/tests/script.test.ts
 * @file script.test.ts
 * @description Tests for script.ts
 *
 * @author thedevmystic (Surya)
 * @copyright 2026-present Suryansh Singh Apache-2.0 License
 *
 * SPDX-FileCopyrightText: 2026-present Suryansh Singh
 * SPDX-License-Identifier: Apache-2.0
 */

import { script } from '../src/script';

/** Build a minimal DOM environment substitute for each test. */
function buildDOM(
  initialClasses: string[] = [],
  initialAttrs: Record<string, string> = {},
) {
  const classList = new Set<string>(initialClasses);
  const attributes = new Map<string, string>(Object.entries(initialAttrs));
  const style: Record<string, string> = {};

  return {
    documentElement: {
      classList: {
        remove: (...cls: string[]) => cls.forEach((c) => classList.delete(c)),
        add: (...cls: string[]) => cls.forEach((c) => classList.add(c)),
        contains: (c: string) => classList.has(c),
        get _values() {
          return [...classList];
        },
      },
      setAttribute: (attr: string, val: string) => attributes.set(attr, val),
      getAttribute: (attr: string) => attributes.get(attr) ?? null,
      removeAttribute: (attr: string) => attributes.delete(attr),
      style,
    },
    /** Snapshot helpers */
    getClasses: () => [...classList],
    getAttr: (a: string) => attributes.get(a),
    getStyle: () => style,
  };
}

/**
 * Run the script function inside a simulated browser environment.
 *
 * Patches globalThis.document, globalThis.window, and globalThis.localStorage
 * so that script.ts — which references these as bare identifiers resolved
 * through globalThis — sees the mock objects instead of the real jsdom ones.
 */
function runScript(
  params: Parameters<typeof script>,
  opts: {
    systemDark?: boolean;
    storedValue?: string | null;
    storageThrows?: boolean;
  } = {},
) {
  const dom = buildDOM();

  const mockLocalStorage = {
    getItem: (_key: string): string | null => {
      if (opts.storageThrows) throw new Error('storage unavailable');
      return opts.storedValue !== undefined ? opts.storedValue : null;
    },
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
  };

  const mockMatchMedia = (query: string) => ({
    matches:
      query === '(prefers-color-scheme: dark)'
        ? (opts.systemDark ?? false)
        : false,
  });

  // Save originals
  const origDocument = globalThis.document;
  const origWindow = globalThis.window;
  const origLocalStorage = globalThis.localStorage;

  // Patch globalThis — script.ts resolves bare `document`, `window`, and
  // `localStorage` through the global scope at call time.
  Object.defineProperty(globalThis, 'document', {
    value: { documentElement: dom.documentElement },
    writable: true,
    configurable: true,
  });
  Object.defineProperty(globalThis, 'window', {
    value: { matchMedia: mockMatchMedia },
    writable: true,
    configurable: true,
  });
  Object.defineProperty(globalThis, 'localStorage', {
    value: mockLocalStorage,
    writable: true,
    configurable: true,
  });

  try {
    script(...params);
  } finally {
    // Restore originals
    Object.defineProperty(globalThis, 'document', {
      value: origDocument,
      writable: true,
      configurable: true,
    });
    Object.defineProperty(globalThis, 'window', {
      value: origWindow,
      writable: true,
      configurable: true,
    });
    Object.defineProperty(globalThis, 'localStorage', {
      value: origLocalStorage,
      writable: true,
      configurable: true,
    });
  }

  return dom;
}

/** Data Attribute Mode Tests */
describe('script – data attribute mode', () => {
  const baseParams = (
    overrides: Partial<Parameters<typeof script>[0]> = {},
  ): Parameters<typeof script> => [
    'data-theme',
    'theme',
    'light',
    undefined,
    ['light', 'dark'],
    undefined,
    false,
    true,
  ];

  test('applies defaultToken when nothing is stored', () => {
    const dom = runScript(baseParams(), { storedValue: null });
    expect(dom.getAttr('data-theme')).toBe('light');
  });

  test('applies stored token when present', () => {
    const dom = runScript(baseParams(), { storedValue: 'dark' });
    expect(dom.getAttr('data-theme')).toBe('dark');
  });

  test('falls back to defaultToken when storage throws', () => {
    const dom = runScript(baseParams(), { storageThrows: true });
    expect(dom.getAttr('data-theme')).toBe('light');
  });

  test('sets colorScheme for light token', () => {
    const dom = runScript(baseParams(), { storedValue: 'light' });
    expect(dom.getStyle().colorScheme).toBe('light');
  });

  test('sets colorScheme for dark token', () => {
    const dom = runScript(baseParams(), { storedValue: 'dark' });
    expect(dom.getStyle().colorScheme).toBe('dark');
  });

  test('does not set colorScheme when enableColorScheme is false', () => {
    const params = baseParams();
    params[7] = false; // enableColorScheme = false
    const dom = runScript(params, { storedValue: 'dark' });
    expect(dom.getStyle().colorScheme).toBeUndefined();
  });
});

/** Tests for the forcedToken parameter */
describe('script – forcedToken', () => {
  test('uses forcedToken instead of stored value', () => {
    const dom = runScript(
      [
        'data-theme',
        'theme',
        'light',
        'dark',
        ['light', 'dark'],
        undefined,
        false,
        true,
      ],
      { storedValue: 'light' },
    );
    expect(dom.getAttr('data-theme')).toBe('dark');
  });

  test('forcedToken sets colorScheme', () => {
    const dom = runScript(
      [
        'data-theme',
        'theme',
        'light',
        'dark',
        ['light', 'dark'],
        undefined,
        false,
        true,
      ],
      {},
    );
    expect(dom.getStyle().colorScheme).toBe('dark');
  });
});

/** Tests for the enableSystem parameter and "system" token resolution */
describe('script – enableSystem', () => {
  test('resolves "system" token to dark when OS is dark', () => {
    const dom = runScript(
      [
        'data-theme',
        'theme',
        'system',
        undefined,
        ['light', 'dark', 'system'],
        undefined,
        true,
        true,
      ],
      { storedValue: 'system', systemDark: true },
    );
    expect(dom.getAttr('data-theme')).toBe('dark');
  });

  test('resolves "system" token to light when OS is light', () => {
    const dom = runScript(
      [
        'data-theme',
        'theme',
        'system',
        undefined,
        ['light', 'dark', 'system'],
        undefined,
        true,
        true,
      ],
      { storedValue: 'system', systemDark: false },
    );
    expect(dom.getAttr('data-theme')).toBe('light');
  });

  test('does not resolve "system" when enableSystem is false', () => {
    // stored value is 'system' but enableSystem=false → applies 'system' literally
    const dom = runScript(
      [
        'data-theme',
        'theme',
        'light',
        undefined,
        ['light', 'dark'],
        undefined,
        false,
        true,
      ],
      { storedValue: 'system', systemDark: true },
    );
    // 'system' is not in the COLOR_SCHEMES array, so colorScheme should not be set
    expect(dom.getAttr('data-theme')).toBe('system');
    expect(dom.getStyle().colorScheme).toBeUndefined();
  });
});

/**
 * Tests for when the first parameter is "class" and the script manipulates
 * class names instead of data attributes.
 */
describe('script – class attribute mode', () => {
  test('adds the correct class for stored token', () => {
    const dom = runScript(
      [
        'class',
        'theme',
        'light',
        undefined,
        ['light', 'dark'],
        undefined,
        false,
        true,
      ],
      { storedValue: 'dark' },
    );
    expect(dom.getClasses()).toContain('dark');
    expect(dom.getClasses()).not.toContain('light');
  });

  test('removes previous token classes before adding new one', () => {
    // Pre-populate with 'light' class
    const classList = new Set(['light']);
    const style: Record<string, string> = {};
    const dom = {
      documentElement: {
        classList: {
          remove: (...cls: string[]) => cls.forEach((c) => classList.delete(c)),
          add: (...cls: string[]) => cls.forEach((c) => classList.add(c)),
        },
        setAttribute: vi.fn(),
        style,
      },
      getClasses: () => [...classList],
    };

    const origDocument = globalThis.document;
    const origWindow = globalThis.window;
    const origLocalStorage = globalThis.localStorage;

    Object.defineProperty(globalThis, 'document', {
      value: { documentElement: dom.documentElement },
      writable: true,
      configurable: true,
    });
    Object.defineProperty(globalThis, 'window', {
      value: { matchMedia: () => ({ matches: false }) },
      writable: true,
      configurable: true,
    });
    Object.defineProperty(globalThis, 'localStorage', {
      value: { getItem: () => 'dark', setItem: vi.fn() },
      writable: true,
      configurable: true,
    });

    script(
      'class',
      'theme',
      'light',
      undefined,
      ['light', 'dark'],
      undefined,
      false,
      true,
    );

    Object.defineProperty(globalThis, 'document', {
      value: origDocument,
      writable: true,
      configurable: true,
    });
    Object.defineProperty(globalThis, 'window', {
      value: origWindow,
      writable: true,
      configurable: true,
    });
    Object.defineProperty(globalThis, 'localStorage', {
      value: origLocalStorage,
      writable: true,
      configurable: true,
    });

    expect(dom.getClasses()).not.toContain('light');
    expect(dom.getClasses()).toContain('dark');
  });

  test('uses value mapping when provided', () => {
    const dom = runScript(
      [
        'class',
        'theme',
        'light',
        undefined,
        ['light', 'dark'],
        { light: 'theme-light', dark: 'theme-dark' },
        false,
        true,
      ],
      { storedValue: 'dark' },
    );
    expect(dom.getClasses()).toContain('theme-dark');
    expect(dom.getClasses()).not.toContain('dark');
  });
});

/** Tests for when the first parameter is an array of attributes to update. */
describe('script – multiple attributes', () => {
  test('applies token to all listed attributes', () => {
    const dom = runScript(
      [
        ['class', 'data-theme'],
        'theme',
        'light',
        undefined,
        ['light', 'dark'],
        undefined,
        false,
        false,
      ],
      { storedValue: 'dark' },
    );
    expect(dom.getClasses()).toContain('dark');
    expect(dom.getAttr('data-theme')).toBe('dark');
  });
});

/**
 * Tests for the value mapping feature where token names can be mapped to
 * custom attribute values.
 */
describe('script – value mapping', () => {
  test('maps token name to custom attribute value', () => {
    const dom = runScript(
      [
        'data-theme',
        'theme',
        'light',
        undefined,
        ['light', 'dark'],
        { light: '0', dark: '1' },
        false,
        false,
      ],
      { storedValue: 'dark' },
    );
    expect(dom.getAttr('data-theme')).toBe('1');
  });

  test('falls back to token name when no mapping exists', () => {
    const dom = runScript(
      [
        'data-theme',
        'theme',
        'light',
        undefined,
        ['light', 'dark', 'custom'],
        { light: '0', dark: '1' },
        false,
        false,
      ],
      { storedValue: 'custom' },
    );
    expect(dom.getAttr('data-theme')).toBe('custom');
  });
});
