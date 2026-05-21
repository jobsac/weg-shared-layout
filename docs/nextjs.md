# Next.js (App Router)

Guide for **Next.js 13+ App Router** (`app/` directory). For Vite/CRA-style client-only React, see **[React SPA](./react.md)**.

## Components

| Tag | Purpose |
| --- | --- |
| `<weg-header>` | Site header — logo (bundled), nav, Sign in / Sign out |
| `<weg-footer>` | Site footer — social, columns, legal text |

Both accept **`layout`** (JSON string recommended in Next). `<weg-header>` also accepts **`signed-in`** and emits **`wegAuthClick`**.

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

## 2. Client layout components

```tsx
// src/components/layout/Header.tsx
'use client';

import { useCallback } from 'react';
import { defineCustomElements } from 'weg-shared-layout/loader';
import 'weg-shared-layout/weg-header';

defineCustomElements();

type LayoutData = {
  header?: {
    dropdowns?: { label: string; items: { label: string; href: string }[] }[];
    links?: { label: string; href: string }[];
    signIn?: { label: string; href: string };
    signOut?: { label: string; href?: string };
  };
};

export function Header({
  layout,
  signedIn,
  onSignedInChange,
}: {
  layout: LayoutData;
  signedIn: boolean;
  onSignedInChange?: (signedIn: boolean) => void;
}) {
  const onAuthClick = useCallback(
    (event: CustomEvent<{ action: 'sign-in' | 'sign-out' }>) => {
      event.preventDefault();

      if (event.detail.action === 'sign-out') {
        // your logout(), then:
        onSignedInChange?.(false);
        return;
      }

      window.location.href = layout.header?.signIn?.href ?? '/account/login';
    },
    [layout, onSignedInChange],
  );

  return (
    <weg-header
      layout={JSON.stringify(layout)}
      signed-in={signedIn}
      suppressHydrationWarning
      // @ts-expect-error Stencil custom event
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

  return (
    <>
      <Header layout={layout} signedIn={signedIn} onSignedInChange={setSignedIn} />
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

## 3. Server layout

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

## 4. Production: fetch layout on the server

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

Wire **`signedIn`** from your auth provider (e.g. session from a client context populated after mount, or a client-only wrapper around `<Header />`).

## Header auth reference

| API | Usage |
| --- | --- |
| `layout.header.signIn` | `{ label, href }` — shown when `signed-in` is false |
| `layout.header.signOut` | `{ label, href? }` — shown when `signed-in` is true |
| `signed-in` prop | Boolean session flag from host app |
| `wegAuthClick` event | `event.detail.action`: `'sign-in'` \| `'sign-out'` |
| `event.preventDefault()` | Skip default link navigation / redirect |

Logo is bundled in the component — not in `layout`.

## Passing `layout` — quick reference

| Approach | Works in Next? |
| --- | --- |
| `layout={object}` on `<weg-header>` / `<weg-footer>` | **No** |
| `layout={JSON.stringify(obj)}` in client wrapper | **Yes** (recommended) |
| Pass object to `<SiteChrome layout={...} />`, stringify in child | **Yes** |
| `ref` + `el.layout = obj` in `useEffect` | Yes (escape hatch) |

## TypeScript

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
| Auth not updating | `signed-in` only on server | Manage session in client state / context. |
| Hydration warning | Shadow DOM mismatch | `suppressHydrationWarning` on both tags. |
| Build error | Package not transpiled | `transpilePackages: ['weg-shared-layout']`. |

## Integration checklist

- [ ] `weg-shared-layout` installed
- [ ] `transpilePackages` in `next.config`
- [ ] Client `Header.tsx` / `Footer.tsx` with loader, tag imports, `JSON.stringify`, `suppressHydrationWarning`
- [ ] Auth: `signed-in` + `wegAuthClick` handler on header
- [ ] Server `layout.tsx` imports client chrome only (no `defineCustomElements` on server)
- [ ] Layout fetched or imported server-side, passed as serializable props
- [ ] TypeScript augmentation for `'weg-header'` and `'weg-footer'`
- [ ] Verified in browser after hydration

## See also

- **[React SPA](./react.md)**
- **[Angular](./angular.md)**
- **[Plain HTML / vanilla JS](./vanilla.md)**
- **[Package readme](../readme.md)**
