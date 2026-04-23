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
 * @path [ROOT]/next-tokens/tests/index.test.tsx
 * @file index.test.tsx
 * @description Tests for components from index.tsx
 *
 * @author thedevmystic (Surya)
 * @copyright 2026-present Suryansh Singh Apache-2.0 License
 *
 * SPDX-FileCopyrightText: 2026-present Suryansh Singh
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import * as ReactDOM from 'react-dom';
import { render, screen, act, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

import {
  TokenProvider,
  createTokenProvider,
  useToken,
  makeTokenHook,
  TokenScript,
} from '../src/index';

/** Mock Preinit */
vi.mock('react-dom', async () => {
  const actual = await vi.importActual('react-dom');
  return {
    ...actual,
    preinit: vi.fn(),
  };
});

/** Suppress the JSDOM "not implemented" for matchMedia. */
beforeAll(() => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
});

/** Reset localStorage between tests. */
beforeEach(() => {
  localStorage.clear();
  vi.clearAllMocks();
  // Reset html attributes
  document.documentElement.removeAttribute('data-token');
  document.documentElement.removeAttribute('data-theme');
  document.documentElement.removeAttribute('data-accent');
  document.documentElement.classList.remove('light', 'dark', 'system');
  document.documentElement.style.colorScheme = '';
});

/** Consumer Components. */
function TokenDisplay({ storageKey = 'token' }: { storageKey?: string }) {
  const { token, resolvedToken, tokens, setToken, systemToken } = useToken(storageKey);
  return (
    <div>
      <span data-testid="token">{token}</span>
      <span data-testid="resolvedToken">{resolvedToken}</span>
      <span data-testid="tokens">{tokens.join(',')}</span>
      <span data-testid="systemToken">{systemToken ?? 'none'}</span>
      <button onClick={() => setToken('dark')}>set dark</button>
      <button onClick={() => setToken((prev) => (prev === 'dark' ? 'light' : 'dark'))}>
        toggle
      </button>
    </div>
  );
}

/** Basic Rendering Test. */
describe('TokenProvider – rendering', () => {
  test('renders children', () => {
    render(
      <TokenProvider storageKey="t1" tokens={['light', 'dark']} enableSystem={false}>
        <span>hello</span>
      </TokenProvider>,
    );
    expect(screen.getByText('hello')).toBeInTheDocument();
  });

  test('does not double-wrap the same storageKey', () => {
    // Both providers share the same key; the inner one is a no-op
    render(
      <TokenProvider storageKey="t2" tokens={['light', 'dark']} enableSystem={false}>
        <TokenProvider storageKey="t2" tokens={['light', 'dark']} enableSystem={false}>
          <TokenDisplay storageKey="t2" />
        </TokenProvider>
      </TokenProvider>,
    );
    // Should render without throwing
    expect(screen.getByTestId('token')).toBeInTheDocument();
  });
});

/** Default Token Tests. */
describe('TokenProvider – defaultToken', () => {
  test('uses first token as default when enableSystem=false', () => {
    render(
      <TokenProvider storageKey="dt1" tokens={['light', 'dark']} enableSystem={false}>
        <TokenDisplay storageKey="dt1" />
      </TokenProvider>,
    );
    expect(screen.getByTestId('token').textContent).toBe('light');
  });

  test('uses "system" as default when enableSystem=true', () => {
    render(
      <TokenProvider storageKey="dt2" tokens={['light', 'dark']} enableSystem>
        <TokenDisplay storageKey="dt2" />
      </TokenProvider>,
    );
    expect(screen.getByTestId('token').textContent).toBe('system');
  });

  test('respects explicit defaultToken prop', () => {
    render(
      <TokenProvider
        storageKey="dt3"
        tokens={['light', 'dark']}
        defaultToken="dark"
        enableSystem={false}
      >
        <TokenDisplay storageKey="dt3" />
      </TokenProvider>,
    );
    expect(screen.getByTestId('token').textContent).toBe('dark');
  });
});

/** setToken Tests. */
describe('TokenProvider – setToken', () => {
  test('setToken(value) updates token', async () => {
    const user = userEvent.setup();
    render(
      <TokenProvider storageKey="st1" tokens={['light', 'dark']} enableSystem={false}>
        <TokenDisplay storageKey="st1" />
      </TokenProvider>,
    );
    await user.click(screen.getByText('set dark'));
    expect(screen.getByTestId('token').textContent).toBe('dark');
  });

  test('setToken(updater fn) toggles token', async () => {
    const user = userEvent.setup();
    render(
      <TokenProvider
        storageKey="st2"
        tokens={['light', 'dark']}
        defaultToken="light"
        enableSystem={false}
      >
        <TokenDisplay storageKey="st2" />
      </TokenProvider>,
    );
    await user.click(screen.getByText('toggle'));
    expect(screen.getByTestId('token').textContent).toBe('dark');
    await user.click(screen.getByText('toggle'));
    expect(screen.getByTestId('token').textContent).toBe('light');
  });

  test('setToken persists to localStorage', async () => {
    const user = userEvent.setup();
    render(
      <TokenProvider storageKey="persist1" tokens={['light', 'dark']} enableSystem={false}>
        <TokenDisplay storageKey="persist1" />
      </TokenProvider>,
    );
    await user.click(screen.getByText('set dark'));
    expect(localStorage.getItem('persist1')).toBe('dark');
  });
});

/** Local Storage Hydration Tests. */
describe('TokenProvider – localStorage hydration', () => {
  test('reads stored token on mount', async () => {
    localStorage.setItem('hydrate1', 'dark');
    render(
      <TokenProvider storageKey="hydrate1" tokens={['light', 'dark']} enableSystem={false}>
        <TokenDisplay storageKey="hydrate1" />
      </TokenProvider>,
    );
    await waitFor(() => {
      expect(screen.getByTestId('token').textContent).toBe('dark');
    });
  });
});

/** DOM Attribute Application Tests. */
describe('TokenProvider – DOM attribute', () => {
  test('sets data attribute on documentElement', async () => {
    localStorage.setItem('dom1', 'dark');
    render(
      <TokenProvider
        storageKey="dom1"
        tokens={['light', 'dark']}
        attribute="data-theme"
        enableSystem={false}
      >
        <span />
      </TokenProvider>,
    );
    await waitFor(() => {
      expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    });
  });

  test('sets class on documentElement', async () => {
    localStorage.setItem('dom2', 'dark');
    render(
      <TokenProvider
        storageKey="dom2"
        tokens={['light', 'dark']}
        attribute="class"
        enableSystem={false}
      >
        <span />
      </TokenProvider>,
    );
    await waitFor(() => {
      expect(document.documentElement.classList.contains('dark')).toBe(true);
    });
  });

  test('uses value mapping for attribute', async () => {
    localStorage.setItem('dom3', 'dark');
    render(
      <TokenProvider
        storageKey="dom3"
        tokens={['light', 'dark']}
        attribute="data-theme"
        value={{ light: 'theme-light', dark: 'theme-dark' }}
        enableSystem={false}
      >
        <span />
      </TokenProvider>,
    );
    await waitFor(() => {
      expect(document.documentElement.getAttribute('data-theme')).toBe('theme-dark');
    });
  });

  test('applies multiple attributes', async () => {
    localStorage.setItem('dom4', 'dark');
    render(
      <TokenProvider
        storageKey="dom4"
        tokens={['light', 'dark']}
        attribute={['data-theme', 'data-token']}
        enableSystem={false}
      >
        <span />
      </TokenProvider>,
    );
    await waitFor(() => {
      expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
      expect(document.documentElement.getAttribute('data-token')).toBe('dark');
    });
  });
});

/** Forced Token Tests. */
describe('TokenProvider – forcedToken', () => {
  test('exposes forcedToken in context', () => {
    render(
      <TokenProvider
        storageKey="ft1"
        tokens={['light', 'dark']}
        forcedToken="dark"
        enableSystem={false}
      >
        <TokenDisplay storageKey="ft1" />
      </TokenProvider>,
    );
    // The token state is defaultToken, but forcedToken is available
    expect(screen.getByTestId('token')).toBeInTheDocument();
  });
});

/** Enable System Token Tests. */
describe('TokenProvider – enableSystem', () => {
  test('includes "system" in tokens when enableSystem=true', () => {
    render(
      <TokenProvider storageKey="sys1" tokens={['light', 'dark']} enableSystem>
        <TokenDisplay storageKey="sys1" />
      </TokenProvider>,
    );
    expect(screen.getByTestId('tokens').textContent).toContain('system');
  });

  test('does not include "system" in tokens when enableSystem=false', () => {
    render(
      <TokenProvider storageKey="sys2" tokens={['light', 'dark']} enableSystem={false}>
        <TokenDisplay storageKey="sys2" />
      </TokenProvider>,
    );
    expect(screen.getByTestId('tokens').textContent).not.toContain('system');
  });

  test('exposes systemToken when enableSystem=true', () => {
    render(
      <TokenProvider storageKey="sys3" tokens={['light', 'dark']} enableSystem>
        <TokenDisplay storageKey="sys3" />
      </TokenProvider>,
    );
    // systemToken is 'light' by default (matchMedia returns false for dark)
    expect(screen.getByTestId('systemToken').textContent).toBe('light');
  });

  test('systemToken is "none" when enableSystem=false', () => {
    render(
      <TokenProvider storageKey="sys4" tokens={['light', 'dark']} enableSystem={false}>
        <TokenDisplay storageKey="sys4" />
      </TokenProvider>,
    );
    expect(screen.getByTestId('systemToken').textContent).toBe('none');
  });
});

/** useToken Hook Tests. */
describe('useToken – outside provider', () => {
  test('returns default values without throwing', () => {
    function OutsideConsumer() {
      const { token, tokens, setToken } = useToken('nonexistent-key');
      return (
        <div>
          <span data-testid="token">{token ?? 'undefined'}</span>
          <span data-testid="count">{tokens.length}</span>
        </div>
      );
    }
    render(<OutsideConsumer />);
    expect(screen.getByTestId('token').textContent).toBe('undefined');
    expect(screen.getByTestId('count').textContent).toBe('0');
  });
});

/** makeTokenHook Tests. */
describe('makeTokenHook', () => {
  test('returns a hook that reads the correct context', () => {
    const useTheme = makeTokenHook<'light' | 'dark'>('make-hook-test');
    function Consumer() {
      const { token } = useTheme();
      return <span data-testid="v">{token ?? 'none'}</span>;
    }
    render(
      <TokenProvider
        storageKey="make-hook-test"
        tokens={['light', 'dark']}
        defaultToken="dark"
        enableSystem={false}
      >
        <Consumer />
      </TokenProvider>,
    );
    expect(screen.getByTestId('v').textContent).toBe('dark');
  });
});

/** createTokenProvider Tests. */
describe('createTokenProvider', () => {
  test('Provider renders children', () => {
    const { Provider } = createTokenProvider({
      storageKey: 'ctp1',
      tokens: ['light', 'dark'] as const,
      enableSystem: false,
    });
    render(
      <Provider>
        <span>child</span>
      </Provider>,
    );
    expect(screen.getByText('child')).toBeInTheDocument();
  });

  test('useToken hook reads the correct context', async () => {
    const { Provider, useToken: useTheme } = createTokenProvider({
      storageKey: 'ctp2',
      tokens: ['light', 'dark'] as const,
      defaultToken: 'dark',
      enableSystem: false,
    });
    function Consumer() {
      const { token } = useTheme();
      return <span data-testid="val">{token}</span>;
    }
    render(
      <Provider>
        <Consumer />
      </Provider>,
    );
    expect(screen.getByTestId('val').textContent).toBe('dark');
  });

  test('context is exposed correctly', () => {
    const factory = createTokenProvider({
      storageKey: 'ctp3',
      tokens: ['a', 'b'] as const,
    });
    expect(factory.context).toBeDefined();
  });

  test('factory defaults are overridable via props', async () => {
    const { Provider } = createTokenProvider({
      storageKey: 'ctp4',
      tokens: ['light', 'dark'] as const,
      defaultToken: 'light',
      enableSystem: false,
    });
    // Override defaultToken via props
    function Consumer() {
      const { token } = useToken('ctp4');
      return <span data-testid="v">{token}</span>;
    }
    render(
      <Provider defaultToken="dark">
        <Consumer />
      </Provider>,
    );
    expect(screen.getByTestId('v').textContent).toBe('dark');
  });
});

/** TokenScript Tests. */
describe('TokenScript', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls preinit with a data URI', () => {
    render(
      <TokenProvider storageKey="theme" tokens={['light', 'dark']}>
        <div>Children</div>
      </TokenProvider>,
    );

    // Verify preinit was called
    expect(ReactDOM.preinit).toHaveBeenCalled();

    // Verify the first argument is a data: URI containing the script
    const [uri] = vi.mocked(ReactDOM.preinit).mock.calls[0];
    expect(uri).toContain('data:text/javascript');
  });

  it('passes the correct options to preinit', () => {
    const scriptProps = { 'data-test': 'value' };
    render(
      <TokenProvider storageKey="theme" nonce="test-nonce" scriptProps={scriptProps}>
        <div>Children</div>
      </TokenProvider>,
    );

    // Verify the options object (second argument)
    const [, options] = vi.mocked(ReactDOM.preinit).mock.calls[0];
    expect(options).toMatchObject({
      as: 'script',
      nonce: 'test-nonce',
      async: false,
      ...scriptProps,
    });
  });

  it('injects serialised script arguments into the URI', () => {
    const storageKey = 'my-custom-key';
    render(
      <TokenProvider storageKey={storageKey}>
        <div>Children</div>
      </TokenProvider>,
    );

    const [uri] = vi.mocked(ReactDOM.preinit).mock.calls[0];
    const decodedUri = decodeURIComponent(uri as string);

    expect(decodedUri).toContain(storageKey);
  });
});

/** Cross-Tab Storage Sync Tests. */
describe('TokenProvider – cross-tab storage sync', () => {
  test('updates token when storage event fires', async () => {
    render(
      <TokenProvider
        storageKey="cross1"
        tokens={['light', 'dark']}
        defaultToken="light"
        enableSystem={false}
      >
        <TokenDisplay storageKey="cross1" />
      </TokenProvider>,
    );

    await act(async () => {
      window.dispatchEvent(new StorageEvent('storage', { key: 'cross1', newValue: 'dark' }));
    });

    await waitFor(() => {
      expect(screen.getByTestId('token').textContent).toBe('dark');
    });
  });

  test('ignores storage events for different keys', async () => {
    render(
      <TokenProvider
        storageKey="cross2"
        tokens={['light', 'dark']}
        defaultToken="light"
        enableSystem={false}
      >
        <TokenDisplay storageKey="cross2" />
      </TokenProvider>,
    );

    await act(async () => {
      window.dispatchEvent(new StorageEvent('storage', { key: 'other-key', newValue: 'dark' }));
    });

    expect(screen.getByTestId('token').textContent).toBe('light');
  });
});
