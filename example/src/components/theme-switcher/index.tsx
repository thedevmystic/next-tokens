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
 * @path [ROOT]/example/src/components/theme-switcher/index.tsx
 * @file index.tsx
 * @description ThemeSwitcher component.
 *
 * @author thedevmystic (Surya)
 * @copyright 2026-present Suryansh Singh Apache-2.0 License
 *
 * SPDX-FileCopyrightText: 2026-present Suryansh Singh
 * SPDX-License-Identifier: Apache-2.0
 */

'use client';

import { useRef, useEffect, useCallback, type KeyboardEvent } from 'react';

import { useTheme, type Theme } from '@example/providers/theme-provider';

import { useIsMounted } from '@example/hooks/use-is-mounted';

import styles from './styles.module.css';

/** Icons for the segments. */
const SunIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 16 16"
    width="13"
    height="13"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden
  >
    <circle cx="8" cy="8" r="2.8" />
    <line x1="8" y1="1.2" x2="8" y2="2.6" />
    <line x1="8" y1="13.4" x2="8" y2="14.8" />
    <line x1="1.2" y1="8" x2="2.6" y2="8" />
    <line x1="13.4" y1="8" x2="14.8" y2="8" />
    <line x1="3.1" y1="3.1" x2="4.1" y2="4.1" />
    <line x1="11.9" y1="11.9" x2="12.9" y2="12.9" />
    <line x1="3.1" y1="12.9" x2="4.1" y2="11.9" />
    <line x1="11.9" y1="4.1" x2="12.9" y2="3.1" />
  </svg>
);

const SystemIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 16 16"
    width="13"
    height="13"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden
  >
    <rect x="1.5" y="2.5" width="13" height="9" rx="1.5" />
    <line x1="5.5" y1="14.5" x2="10.5" y2="14.5" />
    <line x1="8" y1="11.5" x2="8" y2="14.5" />
  </svg>
);

const MoonIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 16 16"
    width="13"
    height="13"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden
  >
    <path d="M13.5 9.5A5.5 5.5 0 0 1 6.5 2.5a5.5 5.5 0 1 0 7 7z" />
  </svg>
);

/** Definition of each segment in the switcher. */
interface Segment {
  value: Theme;
  label: string;
  icon: React.ReactNode;
}

const SEGMENTS: Segment[] = [
  { value: 'light', label: 'Light', icon: <SunIcon /> },
  { value: 'system', label: 'System', icon: <SystemIcon /> },
  { value: 'dark', label: 'Dark', icon: <MoonIcon /> },
];

/** ThemeSwitcher component */
export function ThemeSwitcher() {
  const isMounted = useIsMounted();
  const { token, setToken } = useTheme();

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

  return (
    <div
      ref={rootRef}
      role="radiogroup"
      aria-label="Color theme"
      className={styles.root}
      onKeyDown={handleKeyDown}
    >
      {/* Sliding active pill */}
      <span ref={pillRef} className={styles.pill} aria-hidden />

      {SEGMENTS.map(({ value, label, icon }) => {
        const isActive = token === value;
        return (
          <button
            key={value}
            role="radio"
            aria-checked={isActive}
            data-value={value}
            tabIndex={isActive ? 0 : -1}
            className={`${styles.segment} ${isActive ? styles.active : ''}`}
            onClick={() => setToken(value)}
            title={`Switch to ${label} theme`}
          >
            <span className={styles.icon}>{icon}</span>
            {label}
          </button>
        );
      })}
    </div>
  );
}
