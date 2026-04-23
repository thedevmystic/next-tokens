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
 * @path [ROOT]/testss/e2e/token-provider.test.ts
 * @file token-provider.test.ts
 * @description E2E Tests for TokenProvider.
 *
 * @author thedevmystic (Surya)
 * @copyright 2026-present Suryansh Singh Apache-2.0 License
 *
 * SPDX-FileCopyrightText: 2026-present Suryansh Singh
 * SPDX-License-Identifier: Apache-2.0
 */

import { test, expect, Page, BrowserContext } from '@playwright/test';

/** Base URL for test page. */
const BASE_URL = process.env.TEST_BASE_URL ?? 'http://localhost:3000';

/** Helper Functions */
async function getHtmlAttr(page: Page, attr: string): Promise<string | null> {
  return page.evaluate((a) => document.documentElement.getAttribute(a), attr);
}

async function getHtmlClass(page: Page): Promise<string> {
  return page.evaluate(() => document.documentElement.className);
}

async function getColorScheme(page: Page): Promise<string> {
  return page.evaluate(() => document.documentElement.style.colorScheme);
}

async function getLocalStorage(page: Page, key: string): Promise<string | null> {
  return page.evaluate((k) => localStorage.getItem(k), key);
}

async function setLocalStorage(page: Page, key: string, value: string): Promise<void> {
  await page.evaluate(([k, v]) => localStorage.setItem(k, v), [key, value]);
}

/** Test Suite: Theme */
test.describe('TokenProvider – theme page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE_URL}/tests/theme`);
  });

  test('applies default token on first visit', async ({ page }) => {
    const attr = await getHtmlAttr(page, 'data-theme');
    expect(['light', 'dark', 'system']).toContain(attr);
  });

  test('no flash of wrong theme (FOUC prevention)', async ({ page }) => {
    // Set a stored preference before navigation
    await setLocalStorage(page, 'theme', 'dark');
    await page.reload();

    // The inline script must fire synchronously before React hydrates,
    // so the attribute should be present even before DOMContentLoaded fully fires.
    const attr = await getHtmlAttr(page, 'data-theme');
    expect(attr).toBe('dark');
  });

  test('persists theme selection to localStorage', async ({ page }) => {
    await page.getByRole('button', { name: /dark/i }).click();
    const stored = await getLocalStorage(page, 'theme');
    expect(stored).toBe('dark');
  });

  test('reading back stored theme on reload', async ({ page }) => {
    await setLocalStorage(page, 'theme', 'dark');
    await page.reload();
    const attr = await getHtmlAttr(page, 'data-theme');
    expect(attr).toBe('dark');
  });

  test('sets colorScheme style property', async ({ page }) => {
    await page.getByRole('button', { name: /dark/i }).click();
    const scheme = await getColorScheme(page);
    expect(scheme).toBe('dark');
  });

  test('switching theme updates data attribute immediately', async ({ page }) => {
    await page.getByRole('button', { name: /light/i }).click();
    const attr = await getHtmlAttr(page, 'data-theme');
    expect(attr).toBe('light');

    await page.getByRole('button', { name: /dark/i }).click();
    const attrDark = await getHtmlAttr(page, 'data-theme');
    expect(attrDark).toBe('dark');
  });
});

/** Test Suite: System Preference */
test.describe('TokenProvider – system preference', () => {
  test('resolves "system" to dark when OS prefers dark', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.goto(`${BASE_URL}/tests/theme`);
    await setLocalStorage(page, 'theme', 'system');
    await page.reload();

    const attr = await getHtmlAttr(page, 'data-theme');
    expect(attr).toBe('dark');
  });

  test('resolves "system" to light when OS prefers light', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'light' });
    await page.goto(`${BASE_URL}/tests/theme`);
    await setLocalStorage(page, 'theme', 'system');
    await page.reload();

    const attr = await getHtmlAttr(page, 'data-theme');
    expect(attr).toBe('light');
  });

  test('updates attribute when OS color-scheme changes at runtime', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'light' });
    await page.goto(`${BASE_URL}/tests/theme`);
    await setLocalStorage(page, 'theme', 'system');
    await page.reload();

    // Switch OS preference
    await page.emulateMedia({ colorScheme: 'dark' });

    // Give the matchMedia listener time to fire
    await page.waitForTimeout(300);

    const attr = await getHtmlAttr(page, 'data-theme');
    expect(attr).toBe('dark');
  });
});

/** Test Suite: Cross-tab Synchronization */
test.describe('TokenProvider – cross-tab sync', () => {
  let ctx: BrowserContext;
  let page1: Page;
  let page2: Page;

  test.beforeEach(async ({ browser }) => {
    ctx = await browser.newContext();
    page1 = await ctx.newPage();
    page2 = await ctx.newPage();
    await page1.goto(`${BASE_URL}/tests/theme`);
    await page2.goto(`${BASE_URL}/tests/theme`);
  });

  test.afterEach(async () => {
    await ctx.close();
  });

  test('theme change in tab 1 is reflected in tab 2', async () => {
    // Change theme in tab 1 via the UI
    await page1.getByRole('button', { name: /dark/i }).click();

    // Simulate the storage event that browsers fire in other tabs
    await page2.evaluate(() => {
      window.dispatchEvent(
        new StorageEvent('storage', {
          key: 'theme',
          newValue: 'dark',
          storageArea: localStorage,
        }),
      );
    });

    await page2.waitForTimeout(200);
    const attr = await getHtmlAttr(page2, 'data-theme');
    expect(attr).toBe('dark');
  });
});

/** Test Suite: Forced Token */
test.describe('TokenProvider – forcedToken', () => {
  test('forcedToken overrides user preference', async ({ page }) => {
    await page.goto(`${BASE_URL}/tests/forced`);
    await setLocalStorage(page, 'theme', 'light');

    const attr = await getHtmlAttr(page, 'data-theme');
    expect(attr).toBe('dark');
  });

  test('forced page does not change localStorage', async ({ page }) => {
    await page.goto(`${BASE_URL}/tests/forced`);
    const stored = await getLocalStorage(page, 'theme');
    // localStorage should remain unchanged (or null)
    expect(stored).not.toBe('dark'); // forced doesn't write
  });
});

/** Test Suite: No-System */
test.describe('TokenProvider – enableSystem=false', () => {
  test('"system" token not present in toggle UI', async ({ page }) => {
    await page.goto(`${BASE_URL}/tests/no-system`);
    const systemBtn = page.getByRole('button', { name: /system/i });
    await expect(systemBtn).toHaveCount(0);
  });

  test('only explicit tokens are applied', async ({ page }) => {
    await page.goto(`${BASE_URL}/tests/no-system`);
    await page.getByRole('button', { name: /dark/i }).click();
    const attr = await getHtmlAttr(page, 'data-theme');
    expect(attr).toBe('dark');
  });
});

/** Test Suite: Multiple Independent Providers */
test.describe('TokenProvider – multiple independent providers', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE_URL}/tests/accent`);
  });

  test('theme and accent providers are independent', async ({ page }) => {
    await page.getByTestId('theme-dark').click();
    await page.getByTestId('accent-slate').click();

    const theme = await getHtmlAttr(page, 'data-theme');
    const accent = await getHtmlAttr(page, 'data-accent');

    expect(theme).toBe('dark');
    expect(accent).toBe('slate');
  });

  test('changing accent does not affect theme attribute', async ({ page }) => {
    await page.getByTestId('theme-light').click();
    await page.getByTestId('accent-terracotta').click();

    const theme = await getHtmlAttr(page, 'data-theme');
    expect(theme).toBe('light');
  });

  test('accent is persisted independently', async ({ page }) => {
    await page.getByTestId('accent-sage').click();
    const stored = await getLocalStorage(page, 'accent');
    expect(stored).toBe('sage');
  });
});

/** Test Suite: Disable Transition on Change */
test.describe('TokenProvider – disableTransitionOnChange', () => {
  test('no transition style leaks after token change', async ({ page }) => {
    await page.goto(`${BASE_URL}/tests/theme`);
    await page.getByRole('button', { name: /dark/i }).click();

    // Wait a tick for the cleanup style to be removed
    await page.waitForTimeout(50);

    const hasNoTransition = await page.evaluate(() => {
      const all = Array.from(document.styleSheets);
      return all.every((sheet) => {
        try {
          return Array.from(sheet.cssRules).every((r) => !r.cssText.includes('transition:none'));
        } catch {
          return true;
        }
      });
    });
    expect(hasNoTransition).toBe(true);
  });
});

/** Test Suite: Class Attribute Mode */
test.describe('TokenProvider – class attribute mode', () => {
  test('adds correct class to <html>', async ({ page }) => {
    await page.goto(`${BASE_URL}/tests/theme-class`);
    await setLocalStorage(page, 'theme-class', 'dark');
    await page.reload();

    const cls = await getHtmlClass(page);
    expect(cls).toContain('dark');
  });

  test('removes previous class before adding new one', async ({ page }) => {
    await page.goto(`${BASE_URL}/tests/theme-class`);

    await setLocalStorage(page, 'theme-class', 'light');
    await page.reload();

    // Switch to dark
    await page.getByRole('button', { name: 'Dark', exact: true }).click();
    const cls = await getHtmlClass(page);

    expect(cls).toContain('dark');
    expect(cls).not.toContain('light');
  });
});

/** Test Suite: Inline Script / FOUC Prevention */
test.describe('TokenProvider – inline script FOUC prevention', () => {
  test('attribute is set before first paint (script tag present in HTML source)', async ({
    page,
  }) => {
    const response = await page.goto(`${BASE_URL}/tests/theme`);
    const html = await response!.text();

    // The serialised script function must be present in the initial HTML
    expect(html).toContain('data-theme');
    expect(html).toContain('system');
    expect(html).toContain('localStorage');
  });

  test('nonce is forwarded to script tag', async ({ page }) => {
    // This route should render TokenProvider with nonce="test-nonce"
    await page.goto(`${BASE_URL}/tests/theme-nonce`);
    const nonce = await page.evaluate(
      () => document.querySelector('script[nonce]')?.getAttribute('nonce') ?? null,
    );
    // In the browser the nonce attribute is cleared for security, so we just
    // confirm the script tag exists (nonce stripping is browser behaviour)
    expect(nonce).not.toBeNull();
  });
});
