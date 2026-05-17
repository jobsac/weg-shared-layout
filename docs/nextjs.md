# Next.js (App Router)

Guide for **Next.js 13+ App Router** (`app/` directory). For Vite/CRA-style client-only React, see **[React SPA](./react.md)**.

## Why Next.js is different

| Topic | SPA (React 19) | Next.js App Router |
| --- | --- | --- |
| **Where `<weg-footer>` runs** | Client only | Must be in a **Client Component** (`"use client"`) |
| **Server Components** | N/A | Default in `app/` — cannot call `defineCustomElements()` or touch `window` |
| **SSR output** | N/A | Server HTML is often an **empty** `<weg-footer></weg-footer>` until the client bundle hydrates |
| **`layout={object}`** | Works on React 19+ | **Does not work reliably** — RSC/SSR serializes props; object props on custom elements become useless attributes |
| **Recommended `layout` value** | Object (React 19+) or string | **`JSON.stringify(layout)`** always |

Stencil custom elements need browser APIs. Registration and rendering belong in a small client wrapper; the root **Server** layout only imports that wrapper.

## Requirements

| Requirement | Notes |
| --- | --- |
| **Next.js 13+** | App Router (`app/layout.tsx`) |
| **React 19** | Matches current Next defaults; string `layout` still required for custom elements |
| **`transpilePackages`** | Next must compile `weg-shared-layout` (see below) |

## Install

```bash
npm i weg-shared-layout
# or
pnpm add weg-shared-layout
```

## 1. Transpile the package

In `next.config.ts` / `next.config.js`:

```ts
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['weg-shared-layout'],
};

export default nextConfig;
```

Without this, you may see build errors or stale/uncompiled Stencil output in the Next bundle.

## 2. Client `Footer` component

Create a dedicated Client Component (pattern verified in [weg-payload](https://github.com/jobsac/weg-payload)):

```tsx
// src/components/layout/Footer.tsx
'use client';

import layout from 'weg-shared-layout/dummy-data.json';
import { defineCustomElements } from 'weg-shared-layout/loader';
import 'weg-shared-layout/weg-footer';

defineCustomElements();

export function Footer() {
  return (
    <weg-footer layout={JSON.stringify(layout)} suppressHydrationWarning />
  );
}
```

### Why each line matters

| Line | Purpose |
| --- | --- |
| `'use client'` | Allows `defineCustomElements`, custom element upgrade, and DOM property updates |
| `defineCustomElements()` | Registers `<weg-footer>` in the browser (module runs once per client bundle) |
| `import 'weg-shared-layout/weg-footer'` | Ensures the component definition is bundled |
| `layout={JSON.stringify(layout)}` | Sets a string attribute/property Next/React can pass through SSR → client; component parses JSON |
| `suppressHydrationWarning` | Server renders empty tag; client fills content — avoids React hydration mismatch noise |

Do **not** pass `layout={layoutObject}` in Next — it will not hydrate correctly.

## 3. Server layout: import the client footer

```tsx
// app/layout.tsx (Server Component — no "use client")
import { Footer } from '@/components/layout/Footer';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
        <Footer />
      </body>
    </html>
  );
}
```

Fetch layout on the server and pass it into `<Footer layout={...} />` when you wire production data (see below).

## 4. Production: fetch on the server, stringify for the client

```tsx
// app/layout.tsx
import { Footer } from '@/components/layout/Footer';

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
        {children}
        <Footer layout={layout} />
      </body>
    </html>
  );
}
```

```tsx
// src/components/layout/Footer.tsx
'use client';

import { defineCustomElements } from 'weg-shared-layout/loader';
import 'weg-shared-layout/weg-footer';

defineCustomElements();

type LayoutData = {
  footer?: {
    social?: { platform: string; href: string }[];
    standardLinks?: { label: string; href: string }[];
    credits?: string;
    copyright?: string;
  };
};

export function Footer({ layout }: { layout: LayoutData }) {
  return (
    <weg-footer layout={JSON.stringify(layout)} suppressHydrationWarning />
  );
}
```

**Rule:** whatever crosses the Server → Client boundary must be **serializable**. Pass the plain object into the Client Component, then **`JSON.stringify` inside the client** before setting it on `<weg-footer>`.

## Passing `layout` — quick reference

| Approach | Server Component | Client Component | Works in Next? |
| --- | --- | --- | --- |
| `layout={object}` on `<weg-footer>` | No (don’t use CE directly) | Tried often | **No** |
| `layout={JSON.stringify(obj)}` on `<weg-footer>` | No | Yes | **Yes** (recommended) |
| Pass `layout` object to `<Footer />`, stringify inside | Fetch/await JSON | `JSON.stringify` in JSX | **Yes** (recommended for CMS) |
| `ref` + `el.layout = obj` in `useEffect` | No | Yes | Yes (escape hatch) |
| `prop:layout={obj}` | No | Unreliable | **Avoid** |

## TypeScript

Use **module augmentation** (not triple-slash references in every file). Example `src/types/weg-shared-layout-jsx.d.ts`:

```ts
import type { JSX as WegSharedLayoutJSX } from 'weg-shared-layout';
import type { DetailedHTMLProps, HTMLAttributes } from 'react';

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements extends WegSharedLayoutJSX.IntrinsicElements {
      'weg-footer': WegSharedLayoutJSX.IntrinsicElements['weg-footer'] &
        DetailedHTMLProps<HTMLAttributes<HTMLWegFooterElement>, HTMLWegFooterElement>;
    }
  }
}
```

Enable `resolveJsonModule` if you import `weg-shared-layout/dummy-data.json` in the client footer.

## Troubleshooting

| Symptom | Likely cause | Fix |
| --- | --- | --- |
| `document is not defined` | `defineCustomElements()` in a Server Component | Move registration to `"use client"` `Footer.tsx` only. |
| Empty `<weg-footer>` in Elements panel | SSR placeholder before hydration | Expected until client JS runs; confirm client bundle loads and `defineCustomElements()` ran. |
| Empty footer after hydration | `layout={object}` or missing stringify | Use `layout={JSON.stringify(layout)}` in the client component. |
| Hydration warning on `<weg-footer>` | Server HTML ≠ client DOM | Add `suppressHydrationWarning`; ensure `layout` JSON is identical server vs client props. |
| Build error importing package | Package not transpiled | Add `transpilePackages: ['weg-shared-layout']`. |
| `'weg-footer' is not a known element` (TS) | Missing JSX types | Add module augmentation file above. |
| Footer never upgrades | Loader/tag not imported on client | `import 'weg-shared-layout/weg-footer'` + `defineCustomElements()` in client file. |

### DevTools tips

1. **Elements:** Before hydration, `<weg-footer>` is often empty. After hydration, expand the shadow root — links should appear inside `#shadow-root`.
2. **Console:** Log `document.querySelector('weg-footer')?.layout` in the browser — should be a **string** (JSON) or object, not `undefined`.
3. **Network:** Confirm your layout API returns the same shape as [`dummy-data.json`](../src/assets/dummy-data.json).
4. **React DevTools:** `Footer` should show under a Client Component boundary; parent `layout.tsx` stays a Server Component.

### Ref fallback (if stringify still fails)

```tsx
'use client';

import { useEffect, useRef } from 'react';
import { defineCustomElements } from 'weg-shared-layout/loader';
import 'weg-shared-layout/weg-footer';

defineCustomElements();

export function Footer({ layout }: { layout: unknown }) {
  const ref = useRef<HTMLWegFooterElement>(null);

  useEffect(() => {
    if (ref.current) ref.current.layout = layout as object;
  }, [layout]);

  return <weg-footer ref={ref} suppressHydrationWarning />;
}
```

## Integration checklist

- [ ] `weg-shared-layout` installed
- [ ] `transpilePackages: ['weg-shared-layout']` in `next.config`
- [ ] `Footer.tsx` with `'use client'`, loader, tag import, `JSON.stringify`, `suppressHydrationWarning`
- [ ] Root `app/layout.tsx` imports `<Footer />` (no `defineCustomElements` on server)
- [ ] Layout data fetched server-side (or static import) and passed as serializable props
- [ ] TypeScript module augmentation for `'weg-footer'`
- [ ] Verified in browser after hydration (not only view-source HTML)

## See also

- **[React SPA](./react.md)** — object `layout={...}` on React 19 without SSR
- **[Angular](./angular.md)**
- **[Plain HTML / vanilla JS](./vanilla.md)**
- **[Package readme](../readme.md)**
