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
 * @path [ROOT]/example/src/app/tests/theme-class/page.tsx
 * @file page.tsx
 * @description Tests class attribute.
 *
 * @author thedevmystic (Surya)
 * @copyright 2026-present Suryansh Singh Apache-2.0 License
 *
 * SPDX-FileCopyrightText: 2026-present Suryansh Singh
 * SPDX-License-Identifier: Apache-2.0
 */

'use client';

import { createTokenProvider } from 'next-tokens';

type ThemeClass = 'light' | 'dark' | 'system';

const { Provider: ThemeClassProvider, useToken: useThemeClass } = createTokenProvider<ThemeClass>({
  storageKey: 'theme-class',
  attribute: 'class',
  defaultToken: 'system',
  tokens: ['light', 'dark'],
});

function ThemeClassTestContent() {
  const { setToken, token } = useThemeClass();

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Class Attribute Test</h1>
      <p>
        Current Theme Class: <strong data-testid="current-theme">{token}</strong>
      </p>
      <button data-testid="theme-light" onClick={() => setToken('light')}>
        Light
      </button>
      <button data-testid="theme-dark" onClick={() => setToken('dark')}>
        Dark
      </button>
      <button data-testid="theme-system" onClick={() => setToken('system')}>
        System
      </button>
    </div>
  );
}

export default function ThemeClassTestPage() {
  return (
    <ThemeClassProvider>
      <ThemeClassTestContent />
    </ThemeClassProvider>
  );
}
