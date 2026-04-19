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
 * @path [ROOT]/example/src/app/layout.tsx
 * @file layout.tsx
 * @description Layout for test page.
 *
 * @author thedevmystic (Surya)
 * @copyright 2026-present Suryansh Singh Apache-2.0 License
 *
 * SPDX-FileCopyrightText: 2026-present Suryansh Singh
 * SPDX-License-Identifier: Apache-2.0
 */

import type { Metadata } from 'next';

import { ThemeProvider } from '@example/providers/theme-provider';
import { AccentProvider } from '@example/providers/accent-provider';

import { ThemeSwitcher } from '@example/components/theme-switcher';
import { AccentSwitcher } from '@example/components/accent-switcher';

import '@example/styles/main.css';

/** Metadata */
export const metadata: Metadata = {
  title: 'next-tokens · example',
  description:
    'A multi-instance React token provider with typed hooks and zero FOUC.',
};

/** Layout */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <AccentProvider>
            <div className="layout-root">
              {/* Header */}
              <header className="layout-header">
                <span className="layout-header-logo">
                  next<span>-tokens</span>
                </span>

                <ThemeSwitcher />
                <AccentSwitcher />
              </header>

              {/* Main Content */}
              <main className="layout-main">{children}</main>

              {/* Footer */}
              <footer className="layout-footer">
                <span className="layout-footer-text">
                  thedevmystic · Apache-2.0 License
                </span>
                <span className="layout-footer-text">next-tokens v1.0.0</span>
              </footer>
            </div>
          </AccentProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
