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
 * @path [ROOT]/example/src/app/tests/accent/page.tsx
 * @file page.tsx
 * @description Tests multiple instances.
 *
 * @author thedevmystic (Surya)
 * @copyright 2026-present Suryansh Singh Apache-2.0 License
 *
 * SPDX-FileCopyrightText: 2026-present Suryansh Singh
 * SPDX-License-Identifier: Apache-2.0
 */

'use client';

import { useTheme } from '@example/providers/theme-provider';
import { useAccent } from '@example/providers/accent-provider';

export default function AccentTestPage() {
  const { setToken: setTheme } = useTheme();
  const { setToken: setAccent } = useAccent();

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Multi-Provider Test</h1>

      <div className="theme-controls">
        <button data-testid="theme-light" onClick={() => setTheme('light')}>
          Light Theme
        </button>
        <button data-testid="theme-dark" onClick={() => setTheme('dark')}>
          Dark Theme
        </button>
      </div>

      <div className="accent-controls" style={{ marginTop: '1rem' }}>
        <button data-testid="accent-terracotta" onClick={() => setAccent('terracotta')}>
          Terracotta Accent
        </button>
        <button data-testid="accent-sage" onClick={() => setAccent('sage')}>
          Sage Accent
        </button>
        <button data-testid="accent-slate" onClick={() => setAccent('slate')}>
          Slate Accent
        </button>
        <button data-testid="accent-amber" onClick={() => setAccent('amber')}>
          Amber Accent
        </button>
      </div>
    </div>
  );
}
