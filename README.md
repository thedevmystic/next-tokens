<div align="center">
  <img
    src="https://res.cloudinary.com/dqpszz96x/image/upload/v1776267347/next-tokens-logo_qeg2r1.svg"
    width="250px"
    alt="The Dev Mystic Banner"
  />
  <h1 style="font-size: 1.75rem; margin: 0.625rem 0;">
    next-tokens
  </h1>
  <p>
    Multi-instance token provider for React 18+ supporting theme, accent, and beyond.
  </p>
</div>

<p align="center">
  <img
    src="https://img.shields.io/badge/React_18%2B-ebdbb2?style=flat-square&logo=react&logoColor=458588"
    alt="React 18+"
  />
  <img
    src="https://img.shields.io/badge/Apache%202.0-444444?style=flat-square&logo=apache&logoColor=white"
    alt="License: Apache 2.0"
  />
  <img
    src="https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white"
    alt="TypeScript"
  />
  <img
    src="https://img.shields.io/badge/size-1.9_KB-blue?style=flat-square"
    alt="Size"
  />
  <br />
  <a href="https://github.com/thedevmystic" >
    <img
      src="https://img.shields.io/badge/MADE_WITH_%E2%9D%A4%EF%B8%8F_BY_THEDEVMYSTIC-1f425f?style=for-the-badge"
      alt="made with love by thedevmystic"
    />
  </a>
</p>

<p align="center">
  <a href="https://github.com/thedevmystic/next-tokens/issues/new?assignees=&labels=bug&projects=&template=bug_report.yaml">
    Report Bug
  </a>
  •
  <a href="https://github.com/thedevmystic/next-tokens/issues/new?template=feature_request.yaml">
    Request Feature
  </a>
  •
  <a href="#faq">
    FAQs
  </a>
  •
  <a href="https://github.com/thedevmystic/next-tokens/discussions/new">
    Ask Question
  </a>
</p>

<p align="center">
  Lightweight, type-safe, and flash-free management of design tokens in Next.js apps.
</p>

<details>
<summary>Table of Contents (click to show)</summary>

- [About the Project](#about-the-project)
  - [Introduction](#introduction)
  - [Features](#features)
- [Installation](#installation)
- [How to Use](#how-to-use)
  - [Basic Usage](#basic-usage)
  - [CSS](#css)
    - [With data-attribute](#with-data-attribute)
    - [With Classes](#with-classes)
  - [Changing Token](#changing-token)
- [Detailed Breakdown](#detailed-breakdown)
  - [API Overview](#api-overview)
  - [Parameters Breakdown](#parameters-breakdown)
    - [TokenProvider](#tokenprovider)
    - [useToken](#usetoken)
    - [createTokenProvider](#createtokenprovider)
- [Examples](#examples)
  - [Example - System Preference](#example---system-preference)
  - [Example - Default Token](#example---default-token)
  - [Example - Forced Token](#example---forced-token)
  - [Example - Multiple Instances](#example---multiple-instances)
  - [Example - Attributes](#example---attributes)
  - [Example - Value Remap](#example---value-remap)
  - [Example - Transition on Change](#example---transition-on-change)
  - [Example - More Than Two Tokens](#example---more-than-two-tokens)
  - [Example - Without CSS Variables](#example---without-css-variables)
  - [Example - With TailwindCSS](#example---with-tailwindcss)
  - [Example - Avoid Hydration Mismatch](#example---avoid-hydration-mismatch)
  - [Example - Nonce](#example---nonce)
  - [Example - Script](#example---script)
- [Discussion](#discussion)
- [FAQ](#faq)
- [Contributing](#contributing)
- [Inspiration](#inspiration)
- [License](#license)

</details>

# About the Project

> `next-tokens` is a modern library built to support multiple independent providers, without any headache of flash of unstyled content (FOUC).

## Introduction

In modern UI design, "theme" isn't just Light and Dark anymore. You might need an **Accent Color** (Blue, Red, Green), a **Density** setting (Compact, Loose), or a **Font Scale**. `next-tokens` enables you to stack these providers independently using a single, cohesive API.

You can think of it like `next-themes` but with the support of multiple providers!

## Features

- **Multi-Instance:** Run multiple providers (Theme, Accent, etc.) side-by-side.
- **Zero Flash:** Injects a blocking script to apply tokens before the page paints.
- **Type Safe:** First-class TypeScript support with generics for your custom token values.
- **System Preference:** Syncs with `prefers-color-scheme` automatically.
- **Storage Sync:** Synchronizes changes across multiple browser tabs.
- **Effortless Nesting:** Supports nesting of providers seamlessly.
- **Light-weight:** Only 1.9 KBs of disk space needed for a headache-free token system.

# Installation

```bash
npm install next-tokens
# or
yarn add next-tokens
# or
pnpm add next-tokens
```

# How to Use

> [!IMPORTANT]
> An instance of TokenProvider must wrap the application (usually `layout.tsx`) to provide the context.

## Basic Usage

You can get it running with only 2 lines of code!

Just need to add `TokenProvider` to your `app/layout.tsx`:

```jsx
// app/layout.tsx
import { TokenProvider } from 'next-tokens';

export default function RootLayout({ children }) {
  return (
    <html suppressHydrationWarning>
      <head />
      <body>
        <TokenProvider>{children}</TokenProvider>
      </body>
    </html>
  );
}
```

> [!IMPORTANT]
> `TokenProvider` is a client component, not a server component.
> You also have to add `suppressHydrationWarning` in the `<html>` because `next-tokens` updates elements before hydration. This only applies one level deep and does not block warnings in other components. READ: [Suppress Hydration Warning](https://react.dev/reference/react-dom/client/hydrateRoot#suppressing-unavoidable-hydration-mismatch-errors).

Now, your _Next.js_ app fully supports dark mode, including System preference with `prefers-color-scheme`. The token is also immediately synced between tabs. By default, `next-tokens` modifies the `data-token` attribute on the `html` element.

## CSS

### With data-attribute

You can style your app using data-attribute as:

```css
[data-token='light'] {
  --bg: #fff;
  --fg: #000;
}

[data-token='dark'] {
  --bg: #000;
  --fg: #fff;
}
/* if your attribute was data-theme, then replace data-token with data-theme */
/* you can also add other tokens like hc-light, etc. See below sections to find out. */
```

### With Classes

If you set `attribute="class"`, you can use it as:

```css
:root {
  --bg: #fff;
  --fg: #000;
}

:root.dark {
  --bg: #000;
  --fg: #fff;
}
```

See the [detailed breakdown](#detailed-breakdown) section to find more about this.

## Changing Token

You can change the token with the `useToken` hook:

```jsx
import { useToken } from 'next-tokens';

const TokenSwitcher = () => {
  const { token, setToken } = useToken();

  return (
    <div>
      The current token is: {token}
      <button onClick={() => setToken('light')}>Light Mode</button>
      <button onClick={() => setToken('dark')}>Dark Mode</button>
    </div>
  );
};
```

> [!WARNING]
> The above code is hydration _unsafe_ and will throw a hydration mismatch warning when rendering with SSG or SSR. This is because we cannot know the `token` on the server, so it will always be `undefined` until mounted on the client.
>
> You should delay rendering any token toggling UI until mounted on the client. See [Example - Avoid Hydration Mismatch](#example---avoid-hydration-mismatch).

# Detailed Breakdown

## API Overview

We have two ways to get the provider running:

**1. `TokenProvider` with storage keys:** The simplest way to use `next-tokens` — just bind a `storageKey` with a provider.

```jsx
import { TokenProvider } from 'next-tokens';

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <TokenProvider storageKey="theme" attribute="class">
          {children}
        </TokenProvider>
      </body>
    </html>
  );
}
```

**2. `createTokenProvider`:** A factory function that creates a provider, a typed hook, and a context (Recommended).

```jsx
// providers/theme-provider.tsx
import { createTokenProvider } from 'next-tokens';

// define your token type
export type Theme = 'light' | 'dark' | 'system';

// create your provider
export const {
  Provider: ThemeProvider,
  useToken: useTheme,
  context: themeContext,
} = createTokenProvider<Theme>({
  storageKey: 'theme',
  attribute: 'data-theme',
  defaultToken: 'system',
  enableSystem: true,
  enableColorScheme: true,
  tokens: ['light', 'dark'],
  disableTransitionOnChange: true,
});

// app/layout.tsx
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html suppressHydrationWarning>
      <body>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
```

**3. `useToken` or typed hook:** Used to consume the context you just created.

```jsx
// Using the typed hook from the previous example
import { useTheme } from '@/providers/theme-provider';

const { token, resolvedToken, setToken } = useTheme();

// You can also use the modern React `use` API:
import { use } from 'react';
import { themeContext } from '@/providers/theme-provider';

const { token, setToken } = use(themeContext);
```

## Parameters Breakdown

### TokenProvider

- `children`: The content of the specific provider (full page if used in layout).
- `storageKey`: localStorage key. Must be unique per provider instance. Defaults to `token`. See [Example - Multiple Instances](#example---multiple-instances).
- `defaultToken`: Initial token when nothing is stored. Defaults to `system`. See [Example - Default Token](#example---default-token).
- `forcedToken`: Force a specific token on this subtree, ignoring user preference. Defaults to `undefined`. Does not modify saved token. See [Example - Forced Token](#example---forced-token).
- `enableSystem`: Follow the OS `prefers-color-scheme`. Defaults to `true`. See [Example - System Preference](#example---system-preference).
- `enableColorScheme`: Reflect the active color scheme to the browser for native UI. Defaults to `true`.
- `disableTransitionOnChange`: Suppress CSS transitions while the token is being swapped. Defaults to `false`. See [Example - Transition on Change](#example---transition-on-change).
- `tokens`: List of all valid tokens (e.g., `"light"`, `"dark"`, `"system"`).
- `attribute`: The HTML attribute (or array of attributes) written to `<html>`. Accepts `class` or `data-*`. See [Example - Attributes](#example---attributes).
- `value`: Remap token names to attribute values. See [Example - Value Remap](#example---value-remap).
- `nonce`: CSP nonce forwarded to the inline hydration script. See [Example - Nonce](#example---nonce).
- `scriptProps`: Extra props forwarded to the inline `<script>` tag. See [Example - Script](#example---script).

### useToken

- `token`: The active token value.
- `setToken(token)`: Function to update the token. The API is identical to the [set function](https://react.dev/reference/react/useState#setstate) returned by `useState`. Pass the new token value or use a callback to set the new token based on the current one.
- `forcedToken`: Forced page token or falsy. If `forcedToken` is set, you should disable any token switching UI.
- `resolvedToken`: If `enableSystem` is true and the active token is `"system"`, this returns whether the system preference resolved to `"dark"` or `"light"`. Otherwise, identical to `token`.
- `systemToken`: If `enableSystem` is true, represents the system preference (`"dark"` or `"light"`), regardless of what the active token is.
- `tokens`: List of all valid tokens (e.g., `"light"`, `"dark"`, `"system"`).

### createTokenProvider

- `Provider`: The typed provider component. Accepts the same props as `TokenProvider`.
- `useToken`: The typed hook pre-bound to the factory's `storageKey`.
- `context`: Raw context exposed for use with the modern React `use(context)` API.

> [!NOTE]
> You still need to pass `TokenProvider` props to the factory function as options.

# Examples

You can view the [Live Example](https://next-tokens-example.vercel.app).

## Example - System Preference

System preference is enabled by default. The token will automatically follow the user's OS preference via `prefers-color-scheme`.

```jsx
<ThemeProvider enableSystem={true}>
```

To disable system preference:

```jsx
<ThemeProvider enableSystem={false}>
```

## Example - Default Token

Set a specific default token when nothing is stored in localStorage:

```jsx
<ThemeProvider defaultToken="dark">
```

When `enableSystem` is false, the `defaultToken` falls back to the first entry in `tokens` if not set explicitly.

## Example - Forced Token

Force a specific token on a subtree, ignoring user preference. This is useful for pages that are always dark or always light:

```jsx
// app/marketing/layout.tsx
export default function MarketingLayout({ children }) {
  return <ThemeProvider forcedToken="dark">{children}</ThemeProvider>;
}
```

The saved token in localStorage is not modified. In your UI, you can disable the theme switcher when a token is forced:

```jsx
const { forcedToken } = useTheme();

// Token is forced, disable UI that changes the theme
const disabled = !!forcedToken;
```

## Example - Multiple Instances

`next-tokens` is designed for multi-instance usage. Run as many independent providers as you need — just make sure each has a unique `storageKey`:

```jsx
// providers/theme-provider.tsx
export const { Provider: ThemeProvider, useToken: useTheme } =
  (createTokenProvider < 'light') |
  ('dark' >
    {
      storageKey: 'theme',
      attribute: 'data-theme',
      tokens: ['light', 'dark'],
    });

// providers/accent-provider.tsx
export const { Provider: AccentProvider, useToken: useAccent } =
  (createTokenProvider < 'blue') |
  'red' |
  ('green' >
    {
      storageKey: 'accent',
      attribute: 'data-accent',
      tokens: ['blue', 'red', 'green'],
      enableSystem: false,
      defaultToken: 'blue',
    });

// app/layout.tsx
export default function RootLayout({ children }) {
  return (
    <html suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <AccentProvider>{children}</AccentProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
```

Each provider manages its own localStorage entry, its own DOM attribute, and its own React context — they never interfere with each other.

## Example - Attributes

By default, `next-tokens` sets a `data-token` attribute on `<html>`. You can change this to any `data-*` attribute or to `class`:

```jsx
// Use a custom data attribute
<ThemeProvider attribute="data-theme">

// Use class (e.g. for Tailwind CSS)
<ThemeProvider attribute="class">

// Apply multiple attributes at once
<ThemeProvider attribute={['data-theme', 'class']}>
```

## Example - Value Remap

The token name is used as both the localStorage value and the DOM attribute value by default. You can remap the DOM value independently using the `value` prop:

```jsx
<ThemeProvider value={{ dark: 'dark-mode', light: 'light-mode' }}>
```

With this setup, when the token is `"dark"`:

```js
const { token } = useTheme();
// => "dark"

localStorage.getItem('theme');
// => "dark"

document.documentElement.getAttribute('data-theme');
// => "dark-mode"
```

## Example - Transition on Change

To avoid jarring visual transitions when switching tokens, `next-tokens` can temporarily suppress all CSS transitions during the swap:

```jsx
<ThemeProvider disableTransitionOnChange>
```

This forcefully disables all CSS transitions before the token changes and re-enables them immediately afterward, ensuring UI elements with differing transition durations feel consistent.

## Example - More Than Two Tokens

`next-tokens` supports any number of tokens. Pass your full list via the `tokens` prop:

```jsx
<ThemeProvider tokens={['light', 'dark', 'sepia', 'high-contrast']}>
```

> [!NOTE]
> When you pass `tokens`, the default set (`["light", "dark"]`) is overridden. Include those explicitly if you still want them.

For multi-instance setups, each provider manages its own set of tokens independently.

## Example - Without CSS Variables

`next-tokens` is CSS-agnostic. You can use hard-coded values and everything will work without any flash:

```css
html,
body {
  color: #000;
  background: #fff;
}

[data-token='dark'],
[data-token='dark'] body {
  color: #fff;
  background: #000;
}
```

## Example - With TailwindCSS

> NOTE: Tailwind only supports dark mode in version 2+.

In your `tailwind.config.js`, set the dark mode property to `selector`:

```js
// tailwind.config.js
module.exports = {
  darkMode: 'selector',
};
```

> _Note: If you are using Tailwind < 3.4.1, use `'class'` instead of `'selector'`._

Set the `attribute` on your `ThemeProvider` to `class`:

```jsx
<ThemeProvider attribute="class">
```

That's it! You can now use Tailwind's dark mode classes:

```tsx
<h1 className="text-black dark:text-white">Hello</h1>
```

### Using a custom selector (Tailwind > 3.4.1)

Tailwind also supports a [custom selector](https://tailwindcss.com/docs/dark-mode#customizing-the-selector) for dark mode. Your config would look like:

```js
// tailwind.config.js
module.exports = {
  darkMode: ['selector', '[data-theme="dark"]'],
};
```

And your provider:

```tsx
<ThemeProvider attribute="data-theme">
```

## Example - Avoid Hydration Mismatch

Because `token` is unknown on the server, values from `useToken` will be `undefined` until the component mounts on the client. Rendering theme-dependent UI before mount will cause a hydration mismatch.

**Unsafe (will throw a mismatch warning):**

```jsx
import { useToken } from 'next-tokens';

const TokenSwitch = () => {
  const { token, setToken } = useToken();

  // ❌ `token` is undefined on the server — this will mismatch
  return (
    <select value={token} onChange={(e) => setToken(e.target.value)}>
      <option value="system">System</option>
      <option value="dark">Dark</option>
      <option value="light">Light</option>
    </select>
  );
};
```

**Safe — delay rendering until mounted:**

```jsx
import { useState, useEffect } from 'react';
import { useToken } from 'next-tokens';

const TokenSwitch = () => {
  const [mounted, setMounted] = useState(false);
  const { token, setToken } = useToken();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <select value={token} onChange={(e) => setToken(e.target.value)}>
      <option value="system">System</option>
      <option value="dark">Dark</option>
      <option value="light">Light</option>
    </select>
  );
};
```

**Alternative — lazy load the component:**

```js
import dynamic from 'next/dynamic';

const TokenSwitch = dynamic(() => import('./TokenSwitch'), { ssr: false });
```

To avoid [Layout Shift](https://web.dev/cls/), consider rendering a skeleton or placeholder until mounted.

### Themed Images

Showing different images based on the current token has the same hydration issue. Use `resolvedToken` and render an empty placeholder until the token is resolved:

```jsx
import Image from 'next/image';
import { useTheme } from '@/providers/theme-provider';

function ThemedImage() {
  const { resolvedToken } = useTheme();
  let src;

  switch (resolvedToken) {
    case 'light':
      src = '/light.png';
      break;
    case 'dark':
      src = '/dark.png';
      break;
    default:
      src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
      break;
  }

  return <Image src={src} width={400} height={400} />;
}
```

Alternatively, use CSS to render both versions and hide the unused one — this avoids any hydration issues entirely:

```jsx
function ThemedImage() {
  return (
    <>
      {/* Hidden when dark token is active */}
      <div data-hide-on-token="dark">
        <Image src="light.png" width={400} height={400} />
      </div>

      {/* Hidden when light token is active */}
      <div data-hide-on-token="light">
        <Image src="dark.png" width={400} height={400} />
      </div>
    </>
  );
}
```

```css
[data-token='dark'] [data-hide-on-token='dark'],
[data-token='light'] [data-hide-on-token='light'] {
  display: none;
}
```

## Example - Nonce

If your app uses a [Content Security Policy (CSP)](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP), pass your nonce to allow-list the injected script:

```jsx
<ThemeProvider nonce={yourNonce}>
```

## Example - Script

You can pass additional props to the injected `<script>` tag via `scriptProps`. This is useful for third-party integrations, such as Cloudflare Rocket Loader:

```jsx
// Prevent Cloudflare Rocket Loader from deferring the token script
<ThemeProvider scriptProps={{ 'data-cfasync': 'false' }}>
```

# Discussion

## The Flash

`TokenProvider` automatically injects a blocking script into `<head>` that applies the correct token to the `<html>` element before the rest of your page loads. This means the page will not flash under any circumstances, including forced tokens, system preference, multiple providers, and incognito mode. No `noflash.js` required.

# FAQ

---

**Why is my page still flashing?**

In Next.js dev mode, the page may still flash due to the development runtime. When you build your app in production mode, there will be no flashing.

---

**Why do I get a server/client mismatch error?**

When using `useToken`, you will see a hydration mismatch error when rendering UI that depends on the current token. Many values returned by `useToken` are `undefined` on the server because `localStorage` is unavailable. See [Example - Avoid Hydration Mismatch](#example---avoid-hydration-mismatch) for the fix.

---

**Do I need to use CSS variables?**

No. See [Example - Without CSS Variables](#example---without-css-variables).

---

**Why is `resolvedToken` necessary?**

When supporting the system theme preference, you want your UI to accurately reflect that. If a user has selected "System", the token switcher should display "System" — not "Dark" or "Light".

`resolvedToken` lets you apply the correct visual style (dark or light) at runtime, while `token` continues to report the user's saved preference ("system"):

```jsx
const { resolvedToken } = useTheme();

<div style={{ color: resolvedToken === 'dark' ? 'white' : 'black' }}>
```

---

**Can I use multiple providers for different design axes?**

Yes! That is the primary use case for `next-tokens`. See [Example - Multiple Instances](#example---multiple-instances).

---

**Can I set the attribute on the `<body>` or another element?**

Not currently. The script targets `document.documentElement` (`<html>`). If you have a compelling use case, please open an issue.

---

**Is the injected script minified?**

Yes.

---

**Is seperate scripts are injected for different providers?**

Yes, this is because each provider share nothing and are independent. So, different scripts are injected, though the script is very small and minimal.

**Can I use this with Gatsby or Vite?**

`next-tokens` is built for Next.js App Router. The blocking script injection relies on Next.js rendering behavior and may not work correctly in other frameworks.

---

# Contributing

Contributions are welcome! Please open an issue to discuss what you'd like to change before submitting a pull request.

# Inspiration

It is inspired by `next-themes`, thanks for the inspiration!

# License

Licensed under the [Apache License 2.0](https://www.apache.org/licenses/LICENSE-2.0).

SPDX-License-Identifier: Apache-2.0
