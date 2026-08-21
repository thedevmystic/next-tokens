/* Root Layout */

import type { Metadata } from 'next';

import { ThemeProvider } from '@/providers/theme-provider';
import { AccentProvider } from '@/providers/accent-provider';
import { BatchScript } from '@/providers/batch-script';

import { ThemeSwitcher } from '@/components/theme-switcher';
import { AccentSwitcher } from '@/components/accent-switcher';

import '@/styles/main.css';

/** Metadata */
export const metadata: Metadata = {
  title: 'next-tokens · example',
  description: 'A multi-instance React token provider with typed hooks and zero FOUC.',
};

/** Layout */
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <BatchScript nonce="test-nonce" />
      </head>
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
                <span className="layout-footer-text">thedevmystic · Apache-2.0 License</span>
                <span className="layout-footer-text">next-tokens v1.0.0</span>
              </footer>
            </div>
          </AccentProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
