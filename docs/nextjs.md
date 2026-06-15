# Next.js (App Router)

Guide for **Next.js 13+ App Router** (`app/` directory). For Vite/CRA-style client-only React, see **[React SPA](./react.md)**.

## Components

| Tag | Purpose |
| --- | --- |
| `<weg-header>` | Site header — bundled logo, CMS nav (signed out), built-in nav (signed in), Sign in / Manage Account / Sign out |
| `<weg-footer>` | Site footer — social, menu, legal text |

Both accept **`layout`** (JSON string recommended in Next). `<weg-header>` also accepts **`signed-in`**, **`user-name`**, and emits **`wegAuthClick`**.

## Why Next.js is different

| Topic | SPA (React 19) | Next.js App Router |
| --- | --- | --- |
| **Where components run** | Client only | Must be in **Client Components** (`"use client"`) |
| **Server Components** | N/A | Default in `app/` — cannot call `defineCustomElements()` |
| **SSR output** | N/A | Often empty custom-element tags until client hydrates |
| **`layout={object}` on CE** | Works on React 19+ | **Unreliable** — use **`JSON.stringify(layout)`** |
| **Auth state** | `signed-in` prop | Set in client wrapper from session hook / context |

## Requirements

| Requirement | Notes |
| --- | --- |
| **Next.js 13+** | App Router (`app/layout.tsx`) |
| **`transpilePackages`** | Next must compile `weg-shared-layout` |
| **`suppressHydrationWarning`** | Recommended on both tags (SSR placeholder vs client shadow DOM) |
| **TypeScript** | `resolveJsonModule` if importing `weg-shared-layout/dummy-data.json` on the server |

## Install

```bash
npm i weg-shared-layout
# or
pnpm add weg-shared-layout
```

## 1. Transpile the package

```ts
// next.config.ts
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['weg-shared-layout'],
};

export default nextConfig;
```

## 2. Auth constants (host app)

Keep sign-in/out URLs in your app — not imported from `weg-shared-layout`:

```ts
// src/auth.ts
export const HEADER_SIGN_IN = {
  label: 'Sign in',
  href: 'https://account.warwickemploymentgroup.com/account/login',
};

export const ACCOUNT_LOGIN_HREF = HEADER_SIGN_IN.href;
```

## 3. Client layout components

```tsx
// src/components/layout/Header.tsx
'use client';

import { useCallback } from 'react';
import { defineCustomElements } from 'weg-shared-layout/loader';
import { ACCOUNT_LOGIN_HREF, HEADER_SIGN_IN } from '@/auth';
import 'weg-shared-layout/weg-header';

defineCustomElements();

import type { LayoutData } from 'weg-shared-layout/layout-data';
// Or: import layoutFixture from 'weg-shared-layout/dummy-data.json';
//      type LayoutData = typeof layoutFixture;

export function Header({
  layout,
  signedIn,
  userName,
  onSignedInChange,
}: {
  layout: LayoutData;
  signedIn: boolean;
  userName?: string;
  onSignedInChange?: (signedIn: boolean) => void;
}) {
  const onAuthClick = useCallback(
    (event: CustomEvent<{ action: 'sign-in' | 'sign-out' }>) => {
      event.preventDefault();

      if (event.detail.action === 'sign-out') {
        onSignedInChange?.(false);
        window.location.href = ACCOUNT_LOGIN_HREF;
        return;
      }

      window.location.href = HEADER_SIGN_IN.href;
    },
    [layout, onSignedInChange],
  );

  return (
    <weg-header
      layout={JSON.stringify(layout)}
      signedIn={signedIn}
      {...(userName ? { userName } : {})}
      suppressHydrationWarning
      onWegAuthClick={onAuthClick}
    />
  );
}
```

```tsx
// src/components/layout/Footer.tsx
'use client';

import { defineCustomElements } from 'weg-shared-layout/loader';
import 'weg-shared-layout/weg-footer';

defineCustomElements();

export function Footer({ layout }: { layout: unknown }) {
  return <weg-footer layout={JSON.stringify(layout)} suppressHydrationWarning />;
}
```

```tsx
// src/components/layout/SiteChrome.tsx — optional wrapper
'use client';

import { useState } from 'react';
import { Header } from './Header';
import { Footer } from './Footer';

export function SiteChrome({
  layout,
  children,
}: {
  layout: unknown;
  children: React.ReactNode;
}) {
  const [signedIn, setSignedIn] = useState(false);
  const userName = signedIn ? 'Alex' : undefined; // from your session

  return (
    <>
      <Header
        layout={layout}
        signedIn={signedIn}
        userName={userName}
        onSignedInChange={setSignedIn}
      />
      {children}
      <Footer layout={layout} />
    </>
  );
}
```

### Why `JSON.stringify` and `suppressHydrationWarning`

| Line | Purpose |
| --- | --- |
| `layout={JSON.stringify(layout)}` | Serializable across RSC → client; component parses JSON |
| `suppressHydrationWarning` | Server renders empty tag; client fills shadow DOM |
| `'use client'` | Registration and auth handlers need the browser |

Do **not** pass `layout={layoutObject}` directly on the custom elements in Next.

## 4. Server layout

```tsx
// app/layout.tsx (Server Component)
import { SiteChrome } from '@/components/layout/SiteChrome';
import layout from 'weg-shared-layout/dummy-data.json';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <SiteChrome layout={layout}>{children}</SiteChrome>
      </body>
    </html>
  );
}
```

## 5. Production: fetch layout on the server

```tsx
// app/layout.tsx
import { SiteChrome } from '@/components/layout/SiteChrome';

const LAYOUT_URL = 'https://weg-payload-test.vercel.app/api/layout';

async function getLayout() {
  const res = await fetch(LAYOUT_URL, { next: { revalidate: 60 } });
  if (!res.ok) throw new Error('Failed to load layout');
  return res.json();
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const layout = await getLayout();

  return (
    <html lang="en">
      <body>
        <SiteChrome layout={layout}>{children}</SiteChrome>
      </body>
    </html>
  );
}
```

Pass the plain object into the Client Component; **stringify inside** the header/footer wrappers.

Wire **`signedIn`** and **`userName`** from your auth provider (session hook / context in a client wrapper).

## Header auth reference

| API | Signed out | Signed in |
| --- | --- | --- |
| `layout.header.menu` | CMS nav rendered (groups + flat links incl. Sign in) | Ignored — built-in nav used |
| `layout.header.logoSrc` | Logo image URL (bundled if omitted) | Built-in bundled logo |
| `layout.header.logoHref` | Logo link URL | WEG homepage |
| `signed-in` prop | `false` | `true` — session flag from host app |
| `user-name` prop | — | User's first name on Manage Account |
| `wegAuthClick` event | `'sign-in'` on Sign in click | `'sign-out'` on Sign out click |
| `event.preventDefault()` | Skip default navigation | Skip default redirect |

**Signed-in nav (built into the component):** Find a job, Dashboard, Manage Account, Sign out.

The logo **image** uses `layout.header.logoSrc` when signed out (bundled if omitted). The logo **link** uses `layout.header.logoHref` when provided; otherwise it defaults to the WEG homepage.

## Passing `layout` — quick reference

| Approach | Works in Next? |
| --- | --- |
| `layout={object}` on `<weg-header>` / `<weg-footer>` | **No** |
| `layout={JSON.stringify(obj)}` in client wrapper | **Yes** (recommended) |
| Pass object to `<SiteChrome layout={...} />`, stringify in child | **Yes** |
| `ref` + `el.layout = obj` in `useEffect` | Yes (escape hatch) |

## TypeScript

### Server / client JSON imports

```json
{
  "compilerOptions": {
    "resolveJsonModule": true,
    "moduleResolution": "bundler"
  }
}
```

### JSX module augmentation

```ts
// src/types/weg-shared-layout-jsx.d.ts
import type { JSX as WegSharedLayoutJSX } from 'weg-shared-layout';
import type { DetailedHTMLProps, HTMLAttributes } from 'react';

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements extends WegSharedLayoutJSX.IntrinsicElements {
      'weg-header': WegSharedLayoutJSX.IntrinsicElements['weg-header'] &
        DetailedHTMLProps<HTMLAttributes<HTMLWegHeaderElement>, HTMLWegHeaderElement>;
      'weg-footer': WegSharedLayoutJSX.IntrinsicElements['weg-footer'] &
        DetailedHTMLProps<HTMLAttributes<HTMLWegFooterElement>, HTMLWegFooterElement>;
    }
  }
}
```

## Troubleshooting

| Symptom | Likely cause | Fix |
| --- | --- | --- |
| `document is not defined` | Loader in Server Component | Keep registration in `"use client"` files only. |
| Empty after hydration | Object passed to CE without stringify | `JSON.stringify` in client wrapper. |
| Logo missing | Stale package | Logo is inlined in `logo-data.ts`; rebuild / upgrade. |
| Header not clickable | Overlapping page content | `:host` uses `z-index: 20`; upgrade package if missing. |
| Auth not updating | `signed-in` only on server | Manage session in client state / context. |
| Hydration warning | Shadow DOM mismatch | `suppressHydrationWarning` on both tags. |
| Build error | Package not transpiled | `transpilePackages: ['weg-shared-layout']`. |

## Integration checklist

- [ ] `weg-shared-layout` installed
- [ ] `transpilePackages` in `next.config`
- [ ] Client `Header.tsx` / `Footer.tsx` with loader, tag imports, `JSON.stringify`, `suppressHydrationWarning`
- [ ] Auth: `signed-in`, `user-name`, and `wegAuthClick` handler on header
- [ ] Server `layout.tsx` imports client chrome only (no `defineCustomElements` on server)
- [ ] Layout fetched or imported server-side, passed as serializable props
- [ ] TypeScript augmentation for `'weg-header'` and `'weg-footer'`
- [ ] Verified in browser after hydration

## See also

- **[Documentation index](./README.md)**
- **[React SPA](./react.md)**
- **[Angular](./angular.md)** · **[Angular 16 demo](../demo/angular16/README.md)**
- **[Plain HTML / vanilla JS](./vanilla.md)**
- **[Package readme](../readme.md)**
