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
 * @path [ROOT]/example/src/components/accent-switcher/index.tsx
 * @file index.tsx
 * @description Segmented-control accent switcher (Terracotta / Sage / Slate / Amber)
 *              with an animated sliding pill, colour swatch dots, keyboard
 *              navigation, and a skeleton state to prevent hydration mismatches.
 *
 * @author thedevmystic (Surya)
 * @copyright 2026-present Suryansh Singh Apache-2.0 License
 *
 * SPDX-FileCopyrightText: 2026-present Suryansh Singh
 * SPDX-License-Identifier: Apache-2.0
 */

'use client';

import { useRef, useEffect, useCallback, type KeyboardEvent } from 'react';

import type { Theme } from '@example/providers/theme-provider';
import { useAccent, type Accent } from '@example/providers/accent-provider';
import { useIsMounted } from '@example/hooks/use-is-mounted';

import styles from './styles.module.css';

/** Colour value for each accent token — used to render the swatch dot. */
const ACCENT_COLORS_LIGHT: Record<Accent, string> = {
  terracotta: 'oklch(0.52 0.1003 35.5)',
  sage: 'oklch(0.49 0.0875 147.55)',
  slate: 'oklch(0.48 0.0743 223.55)',
  amber: 'oklch(0.58 0.0999 77.81)',
};
const ACCENT_COLORS_DARK: Record<Accent, string> = {
  terracotta: 'oklch(0.72 0.1707 45.81)',
  sage: 'oklch(0.73 0.1542 154.55)',
  slate: 'oklch(0.74 0.0928 195.26)',
  amber: 'oklch(0.74 0.1595 82.99)',
};

/** Definition of each segment in the switcher. */
interface Segment {
  value: Accent;
  label: string;
}

const SEGMENTS: Segment[] = [
  { value: 'terracotta', label: 'Terracotta' },
  { value: 'sage', label: 'Sage' },
  { value: 'slate', label: 'Slate' },
  { value: 'amber', label: 'Amber' },
];

/** AccentSwitcher component */
export function AccentSwitcher() {
  const isMounted = useIsMounted();
  const { token, setToken } = useAccent();

  const rootRef = useRef<HTMLDivElement>(null);
  const pillRef = useRef<HTMLSpanElement>(null);

  /** Slide the pill to the currently active segment button. */
  const syncPill = useCallback(() => {
    const root = rootRef.current;
    const pill = pillRef.current;
    if (!root || !pill) return;

    const active = root.querySelector<HTMLButtonElement>(`button[data-value="${token}"]`);
    if (!active) return;

    const rootRect = root.getBoundingClientRect();
    const activeRect = active.getBoundingClientRect();

    const left = activeRect.left - rootRect.left - 3; // subtract padding
    const width = activeRect.width;

    pill.style.setProperty('--pill-left', `${left}px`);
    pill.style.setProperty('--pill-width', `${width}px`);
  }, [token]);

  useEffect(() => {
    syncPill();
  }, [syncPill]);

  /** Arrow-key navigation within the radiogroup. */
  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const idx = SEGMENTS.findIndex((s) => s.value === token);
    if (idx === -1) return;

    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      const nextSegment = SEGMENTS[(idx + 1) % SEGMENTS.length];
      if (nextSegment) setToken(nextSegment.value);
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      const prevSegment = SEGMENTS[(idx - 1 + SEGMENTS.length) % SEGMENTS.length];
      if (prevSegment) setToken(prevSegment.value);
    }
  };

  /* Render a skeleton on the server / before mount to avoid hydration mismatch */
  if (!isMounted) {
    return <div className={styles.skeleton} aria-hidden />;
  }

  /* Current Theme */
  const theme = document.documentElement.getAttribute('data-theme') as Theme;

  return (
    <div
      ref={rootRef}
      role="radiogroup"
      aria-label="Accent colour"
      className={styles.root}
      onKeyDown={handleKeyDown}
    >
      {/* Sliding active pill */}
      <span ref={pillRef} className={styles.pill} aria-hidden />

      {SEGMENTS.map(({ value, label }) => {
        const isActive = token === value;
        return (
          <button
            key={value}
            role="radio"
            aria-checked={isActive}
            data-value={value}
            tabIndex={isActive ? 0 : -1}
            className={`${styles.segment} ${isActive ? styles.active : ''}`}
            style={
              {
                '--swatch-color':
                  theme == 'light' ? ACCENT_COLORS_LIGHT[value] : ACCENT_COLORS_DARK[value],
              } as React.CSSProperties
            }
            onClick={() => setToken(value)}
            title={`Switch to ${label} accent`}
          >
            <span className={styles.swatch} aria-hidden />
            {label}
          </button>
        );
      })}
    </div>
  );
}
