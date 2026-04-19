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
 * @path [ROOT]/example/src/app/tests/no-system/page.tsx
 * @file page.tsx
 * @description Tests enableSystem={false} functionality.
 *
 * @author thedevmystic (Surya)
 * @copyright 2026-present Suryansh Singh Apache-2.0 License
 *
 * SPDX-FileCopyrightText: 2026-present Suryansh Singh
 * SPDX-License-Identifier: Apache-2.0
 */

'use client';

import { ThemeProvider, useTheme } from '@example/providers/theme-provider';

function NoSystemContent() {
  const { tokens, setToken } = useTheme();

  return (
    <div style={{ padding: '2rem' }}>
      <h1>No-System Test</h1>
      {!tokens.includes('system' as any) && (
        <>
          <button onClick={() => setToken('light')}>Light</button>
          <button onClick={() => setToken('dark')}>Dark</button>
        </>
      )}
    </div>
  );
}

export default function NoSystemPage() {
  return (
    <ThemeProvider enableSystem={false}>
      <NoSystemContent />
    </ThemeProvider>
  );
}
