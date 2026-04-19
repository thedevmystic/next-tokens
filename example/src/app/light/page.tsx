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
 * @path [ROOT]/example/src/app/page.tsx
 * @file page.tsx
 * @description Test page content.
 *
 * @author thedevmystic (Surya)
 * @copyright 2026-present Suryansh Singh Apache-2.0 License
 *
 * SPDX-FileCopyrightText: 2026-present Suryansh Singh
 * SPDX-License-Identifier: Apache-2.0
 */

'use client';

import { ThemeProvider, useTheme } from '@example/providers/theme-provider';

/** Sub Components */
function StatCard({
  label,
  value,
  sub,
}: {
  label: string;
  value: string | undefined;
  sub?: string;
}) {
  return (
    <div className="card">
      <div className="card-label">{label}</div>
      <div className="card-value">{value ?? '—'}</div>
      {sub && <div className="card-sub">{sub}</div>}
    </div>
  );
}

function ThemeStats() {
  const { token, resolvedToken, systemToken, tokens, forcedToken } = useTheme();

  return (
    <div className="demo-grid">
      <StatCard label="Token" value={token} sub="raw value from localStorage" />
      <StatCard
        label="Resolved Token"
        value={resolvedToken}
        sub="'system' resolved to OS preference"
      />
      <StatCard
        label="System Token"
        value={systemToken ?? 'n/a'}
        sub="OS prefers-color-scheme"
      />
      <StatCard
        label="Tokens"
        value={tokens.join(', ')}
        sub="all available tokens"
      />
      {forcedToken && (
        <StatCard
          label="Forced Token"
          value={forcedToken}
          sub="page-level override"
        />
      )}
    </div>
  );
}

/** Page */
export default function Page() {
  return (
    <ThemeProvider forcedToken="light">
      {/* hero */}
      <section className="page-hero">
        <p className="page-hero-eyebrow">token-provider · live demo</p>
        <h1 className="page-hero-title">
          Multi-instance token provider for react <em>&amp; next.js</em>
        </h1>
        <p className="page-hero-desc">
          Independent, typed, zero-fouc context providers for theme, accent,
          locale, or any discrete token — each backed by its own localstorage
          key and inline hydration script.
        </p>
      </section>

      {/* Live state */}
      <section className="section">
        <div className="section-header">
          <h2 className="section-title">Live State</h2>
          <span className="section-badge">useTheme()</span>
        </div>
        <ThemeStats />
      </section>

      {/* Multi-instance */}
      <section className="section">
        <div className="section-header">
          <h2 className="section-title">Multi-instance — Accent Provider</h2>
          <span className="section-badge">useAccent()</span>
        </div>
        <p>
          A second independent provider running under{' '}
          <code>storageKey="accent"</code>. The two providers share zero state.
          It supports infinitely many providers, each with their own discrete
          tokens and storage keys.
        </p>
      </section>

      {/* Forced Page */}
      <section className="section">
        <div className="section-header">
          <h2 className="section-title">Forced Token — Light</h2>
          <span className="section-badge">forcedToken</span>
        </div>
        <p>
          This page-level override forces the token to 'light' on this page
          only, ignoring the user's saved preference. Useful for demos,
          previews, or any time you want to temporarily ignore the user's saved
          token.
          <br />
          Return to Home: <a href="/">Here</a>.
        </p>
      </section>

      {/* Quick-start */}
      <section className="section">
        <div className="section-header">
          <h2 className="section-title">Quick-start</h2>
          <span className="section-badge">createTokenProvider()</span>
        </div>
        <div className="code-block">
          <pre>
            <span className="token-comment">
              // providers/theme-provider.tsx
            </span>
            <br />
            <span className="token-keyword">import</span>{' '}
            <span className="token-punctuation">{'{ '}</span>
            createTokenProvider
            <span className="token-punctuation">{' }'}</span>{' '}
            <span className="token-keyword">from</span>{' '}
            <span className="token-string">'next-tokens'</span>
            <span className="token-punctuation">{';'}</span>
            <br />
            <br />
            <span className="token-comment">// define your token type</span>
            <br />
            <span className="token-keyword">export type</span>{' '}
            <span className="token-type">Theme</span>{' '}
            <span className="token-operator">=</span>{' '}
            <span className="token-string">'light'</span>{' '}
            <span className="token-operator">|</span>{' '}
            <span className="token-string">'dark'</span>{' '}
            <span className="token-operator">|</span>{' '}
            <span className="token-string">'system'</span>
            <span className="token-punctuation">{';'}</span>
            <br />
            <br />
            <span className="token-comment">// create your provider</span>
            <br />
            <span className="token-keyword">export const</span>{' '}
            <span className="token-punctuation">{'{'}</span>
            <br />
            &nbsp;&nbsp;<span className="token-member">Provider</span>
            <span className="token-punctuation">:</span>{' '}
            <span className="token-type">ThemeProvider</span>
            <span className="token-punctuation">,</span>
            <br />
            &nbsp;&nbsp;<span className="token-member">useToken</span>
            <span className="token-punctuation">:</span>{' '}
            <span className="token-type">useTheme</span>
            <span className="token-punctuation">,</span>
            <br />
            &nbsp;&nbsp;<span className="token-member">context</span>
            <span className="token-punctuation">:</span>{' '}
            <span className="token-type">themeContext</span>
            <span className="token-punctuation">,</span>
            <br />
            <span className="token-punctuation">{'}'}</span>{' '}
            <span className="token-operator">=</span>{' '}
            <span className="token-function">createTokenProvider</span>
            <span className="token-punctuation">{'<'}</span>
            <span className="token-type">Theme</span>
            <span className="token-punctuation">{'>({'}</span>
            <br />
            &nbsp;&nbsp;<span className="token-comment">/* options */</span>
            <br />
            &nbsp;&nbsp;<span className="token-member">storageKey</span>
            <span className="token-operator">:</span>{' '}
            <span className="token-string">'theme'</span>
            <span className="token-punctuation">,</span>
            <br />
            &nbsp;&nbsp;<span className="token-member">attribute</span>
            <span className="token-operator">:</span>{' '}
            <span className="token-string">'data-theme'</span>
            <span className="token-punctuation">,</span>
            <br />
            &nbsp;&nbsp;<span className="token-member">defaultToken</span>
            <span className="token-operator">:</span>{' '}
            <span className="token-string">'system'</span>
            <span className="token-punctuation">,</span>
            <br />
            &nbsp;&nbsp;<span className="token-member">enableSystem</span>
            <span className="token-operator">:</span>{' '}
            <span className="token-literal">true</span>
            <span className="token-punctuation">,</span>
            <br />
            &nbsp;&nbsp;<span className="token-member">enableColorscheme</span>
            <span className="token-operator">:</span>{' '}
            <span className="token-literal">true</span>
            <span className="token-punctuation">,</span>
            <br />
            &nbsp;&nbsp;<span className="token-member">tokens</span>
            <span className="token-operator">:</span>{' '}
            <span className="token-punctuation">{'['}</span>
            <span className="token-string">'light'</span>
            <span className="token-punctuation">,</span>{' '}
            <span className="token-string">'dark'</span>
            <span className="token-punctuation">{']'}</span>
            <span className="token-punctuation">,</span>
            <br />
            &nbsp;&nbsp;
            <span className="token-member">disableTransitionOnChange</span>
            <span className="token-operator">:</span>{' '}
            <span className="token-literal">true</span>
            <span className="token-punctuation">,</span>
            <br />
            <span className="token-punctuation">{'});'}</span> <br />
            <br />
            <span className="token-comment">
              // export your provider, hook, and context
            </span>
            <br />
            <span className="token-keyword">export</span>{' '}
            <span className="token-punctuation">{'{ '}</span>
            <span className="token-type">ThemeProvider</span>
            <span className="token-punctuation">,</span>{' '}
            <span className="token-type">useTheme</span>
            <span className="token-punctuation">,</span>{' '}
            <span className="token-type">themeContext</span>
            <span className="token-punctuation">{' };'}</span>
            <br />
            <br />
            <span className="token-comment">// app/layout.tsx</span>
            <br />
            <span className="token-keyword">export default function</span>{' '}
            <span className="token-function">RootLayout</span>
            <span className="token-punctuation">{'({ '}</span>
            <br />
            &nbsp;&nbsp;<span className="token-member">children</span>
            <span className="token-punctuation">{','}</span>
            <br />
            <span className="token-punctuation">{'}'}</span>
            <span className="token-operator">{':'}</span>{' '}
            <span className="token-punctuation">{'{'}</span>
            <br />
            &nbsp;&nbsp;<span className="token-member">children</span>
            <span className="token-operator">{':'}</span>{' '}
            <span className="token-type">ReactNode</span>
            <span className="token-punctuation">{';'}</span>
            <br />
            <span className="token-punctuation">{'}) {'}</span>
            <br />
            &nbsp;&nbsp;<span className="token-keyword">return</span>{' '}
            <span className="token-punctuation">{'('}</span>
            <br />
            &nbsp;&nbsp;&nbsp;&nbsp;
            <span className="token-punctuation">{'<'}</span>
            <span className="token-type">html</span>{' '}
            <span className="token-member">suppressHydrationWarning</span>
            <span className="token-punctuation">{'>'}</span>
            <br />
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
            <span className="token-punctuation">{'<'}</span>
            <span className="token-type">body</span>
            <span className="token-punctuation">{'>'}</span>
            <br />
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
            <span className="token-punctuation">{'<'}</span>
            <span className="token-type">ThemeProvider</span>
            <span className="token-punctuation">{'>'}</span>
            <br />
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
            <span className="token-punctuation">{'{'}</span>
            <span className="token-member">children</span>
            <span className="token-punctuation">{'}'}</span>
            <br />
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
            <span className="token-punctuation">{'<'}</span>
            <span className="token-type">/ThemeProvider</span>
            <span className="token-punctuation">{'>'}</span>
            <br />
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
            <span className="token-punctuation">{'<'}</span>
            <span className="token-type">/body</span>
            <span className="token-punctuation">{'>'}</span>
            <br />
            &nbsp;&nbsp;&nbsp;&nbsp;
            <span className="token-punctuation">{'<'}</span>
            <span className="token-type">/html</span>
            <span className="token-punctuation">{'>'}</span>
            <br />
            &nbsp;&nbsp;<span className="token-punctuation">{');'}</span>
            <br />
            <span className="token-punctuation">{'}'}</span>
            <br />
            <br />
            <span className="token-comment">// anywhere in your app</span>
            <br />
            <span className="token-keyword">const</span>{' '}
            <span className="token-punctuation">{'{ '}</span>
            token
            <span className="token-punctuation">,</span> resolvedToken
            <span className="token-punctuation">,</span> setToken
            <span className="token-punctuation">{' }'}</span>{' '}
            <span className="token-operator">=</span>{' '}
            <span className="token-function">useTheme</span>
            <span className="token-punctuation">{'();'}</span>
            <br />
            <br />
            <span className="token-comment">
              // for more information consult package's README.md
            </span>
          </pre>
        </div>
      </section>
    </ThemeProvider>
  );
}
