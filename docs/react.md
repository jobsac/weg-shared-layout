# React (SPA)

Guide for **client-rendered** React apps (Vite, Create React App, etc.). If you use **Next.js App Router**, see **[Next.js](./nextjs.md)** — SSR and Server Components require a different integration.

## Components

| Tag | Purpose |
| --- | --- |
| `<weg-header>` | Site header — bundled logo, CMS nav (signed out), built-in nav (signed in), Sign in / Manage Account / Sign out |
| `<weg-footer>` | Site footer — social links, menu, credits, copyright |

Both are **presentational** [Stencil](https://stenciljs.com/) Web Components. They **do not fetch data** — your app passes a **`layout`** payload (API, CMS, or [`dummy-data.json`](../src/assets/dummy-data.json)).

`<weg-header>` additionally accepts **`signed-in`**, **`user-name`**, **`account-base-url`**, and emits **`wegAuthClick`**.

## Requirements

| Requirement | Notes |
| --- | --- |
| **React 19+** | React 19 maps custom-element props to DOM **properties** when possible. Older React often sets props as string **attributes**, which breaks object payloads. |
| **Bundler** | Must resolve `node_modules` ESM/CJS from `weg-shared-layout`. |
| **TypeScript (optional)** | `resolveJsonModule` + `moduleResolution` `bundler` / `node16` for JSON/subpath imports; module augmentation below. |

## Install

```bash
npm i weg-shared-layout
# or
pnpm add weg-shared-layout
```

## 1. Register custom elements (once)

Call `defineCustomElements()` **once** before the first render — typically in `main.tsx` / `index.tsx`:

```ts
import { defineCustomElements } from 'weg-shared-layout/loader';

defineCustomElements();
```

**Alternative** — side-effect imports per tag (requires modern `moduleResolution`; see [angular.md § Troubleshooting](./angular.md#troubleshooting)):

```ts
import 'weg-shared-layout/weg-header';
import 'weg-shared-layout/weg-footer';
```

## 2. Layout shell

### Recommended: pass `layout` as an object (React 19+)

```tsx
import 'weg-shared-layout/weg-header';
import 'weg-shared-layout/weg-footer';
import layout from 'weg-shared-layout/dummy-data.json';

export function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <weg-header layout={layout} />
      {children}
      <weg-footer layout={layout} />
    </>
  );
}
```

### Fallback: `JSON.stringify` (React 18 or empty components)

```tsx
<weg-header layout={JSON.stringify(layout)} />
<weg-footer layout={JSON.stringify(layout)} />
```

## 3. Header auth

Sign-in is a normal `header.menu` link — add it in your CMS like Register. The header recognizes **Sign in** by label or login URL and navigates to `href`.

### Signed in

Set **`signed-in`** and optionally **`user-name`**. The component **ignores CMS nav** and shows built-in links: Find a job, Dashboard, Manage Account, Sign out. Pass **`account-base-url`** when account links should use a non-production portal.

Handle **`wegAuthClick`** only for custom sign-out behaviour:

```ts
// auth.ts
export const ACCOUNT_SIGN_OUT_HREF = 'https://account.warwickemploymentgroup.com/account/login';
```

```tsx
import { useCallback, useState } from 'react';
import { ACCOUNT_SIGN_OUT_HREF } from './auth';
import 'weg-shared-layout/weg-header';
import layout from 'weg-shared-layout/dummy-data.json';

export function SiteHeader() {
  const [signedIn, setSignedIn] = useState(false);
  const userName = signedIn ? 'Alex' : undefined;

  const onAuthClick = useCallback((event: CustomEvent<{ action: 'sign-in' | 'sign-out' }>) => {
    if (event.detail.action !== 'sign-out') return;

    event.preventDefault();
    setSignedIn(false);
    window.location.href = ACCOUNT_SIGN_OUT_HREF;
  }, []);

  return (
    <weg-header
      layout={layout}
      signedIn={signedIn}
      {...(userName ? { userName } : {})}
      onWegAuthClick={onAuthClick}
    />
  );
}
```

| Prop / event | Purpose |
| --- | --- |
| `signedIn={boolean}` | Switches to signed-in nav when `true` |
| `userName={string}` | First name beside profile icon on Manage Account |
| `accountBaseUrl={string}` | Account portal origin for signed-in links (optional) |
| `onWegAuthClick` | Optional — handle `sign-out`; sign-in follows link `href` |

**Ref fallback for the event** (if `onWegAuthClick` does not bind in your React version):

```tsx
import { useEffect, useRef } from 'react';

const ref = useRef<HTMLWegHeaderElement>(null);

useEffect(() => {
  const el = ref.current;
  if (!el) return;

  const handler = (event: Event) => {
    const e = event as CustomEvent<{ action: 'sign-in' | 'sign-out' }>;
    e.preventDefault();
    // ...
  };

  el.addEventListener('wegAuthClick', handler);
  return () => el.removeEventListener('wegAuthClick', handler);
}, []);

return <weg-header ref={ref} layout={layout} signedIn={signedIn} userName="Alex" />;
```

## 4. Production: fetch layout from your API

```tsx
import { useEffect, useState } from 'react';
import 'weg-shared-layout/weg-header';
import 'weg-shared-layout/weg-footer';
import layoutFixture from 'weg-shared-layout/dummy-data.json';

type LayoutData = typeof layoutFixture;

const LAYOUT_URL = 'https://weg-payload-test.vercel.app/api/layout';

export function SiteLayout({ children }: { children: React.ReactNode }) {
  const [layout, setLayout] = useState<LayoutData | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch(LAYOUT_URL)
      .then((res) => {
        if (!res.ok) throw new Error(`layout fetch failed: ${res.status}`);
        return res.json() as Promise<LayoutData>;
      })
      .then((data) => {
        if (!cancelled) setLayout(data);
      })
      .catch(console.error);
    return () => {
      cancelled = true;
    };
  }, []);

  if (!layout) return null;

  return (
    <>
      <weg-header layout={layout} />
      {children}
      <weg-footer layout={layout} />
    </>
  );
}
```

Replace the URL with your CMS/API. Keep the object shape aligned with `dummy-data.json`.

## TypeScript

### JSON + package subpaths

```json
{
  "compilerOptions": {
    "resolveJsonModule": true,
    "moduleResolution": "bundler"
  }
}
```

```ts
import layoutFixture from 'weg-shared-layout/dummy-data.json';
export type LayoutData = typeof layoutFixture;
```

Or types only: `import type { LayoutData } from 'weg-shared-layout/layout-data'`.

### JSX module augmentation

Add once (e.g. `src/types/weg-shared-layout-jsx.d.ts`):

```ts
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

## `layout` prop vs attribute

| How data is set | Works with object? |
| --- | --- |
| **Property** `el.layout = obj` / React 19 `layout={obj}` | Yes |
| **Attribute** `layout="[object Object]"` / React 18 `layout={obj}` | No — components stay empty |
| **Attribute** `layout={JSON.stringify(obj)}` | Yes — component parses JSON |

## Troubleshooting

| Symptom | Likely cause | Fix |
| --- | --- | --- |
| Empty header/footer | Loader/tag import missing | `defineCustomElements()` + tag imports. |
| Empty despite correct data | React set `layout` as attribute | React 19+, or `JSON.stringify`, or ref assignment. |
| Logo missing on header | Old build without inlined logo | Upgrade package; logo is bundled in `logo-data.ts`. |
| Auth always Sign in | `signed-in` not set | Bind `signedIn={!!session}`. |
| Manage Account shows label not name | `user-name` not set | Pass `userName` when signed in. |
| `onWegAuthClick` not firing | React CE event binding | Use `addEventListener` on a ref. |
| TS: unknown element | No augmentation | Add `weg-shared-layout-jsx.d.ts`. |

## See also

- **[Documentation index](./README.md)**
- **[Next.js App Router](./nextjs.md)**
- **[Angular](./angular.md)** · **[Angular 16 demo](../demo/angular16/README.md)**
- **[Plain HTML / vanilla JS](./vanilla.md)**
- **[Package readme](../readme.md)**
