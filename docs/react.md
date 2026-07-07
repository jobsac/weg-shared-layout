# React (SPA)

Guide for **client-rendered** React apps (Vite, Create React App, and similar). If you use **Next.js App Router**, see **[Next.js](./nextjs.md)** because SSR and Server Components need a different integration.

## Components

| Tag | Purpose |
| --- | --- |
| `<weg-header>` | Site header — bundled logo, CMS nav (signed out), built-in nav (signed in), Sign in / Manage Account / Sign out |
| `<weg-footer>` | Site footer — social links, menu, credits, copyright |

Both are **presentational** [Stencil](https://stenciljs.com/) Web Components. They **do not fetch data**. Your app passes a **`layout`** payload from the WEG CMS WEG21 API (for example via [`fetchWeg21Layout`](../src/utils/menus.ts)) or from the bundled offline fixtures [`weg21-bootstrap.json`](../src/assets/weg21-bootstrap.json) and [`weg21-menus.json`](../src/assets/weg21-menus.json).

`<weg-header>` additionally accepts **`signed-in`**, **`user-name`**, **`account-base-url`**, **`current-path`**, and emits **`wegAuthClick`**.

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
import { dummyWeg21LayoutData } from 'weg-shared-layout/menus';
const layout = dummyWeg21LayoutData();

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

Set **`signed-in`** and optionally **`user-name`**. If `layout.header.menu` is present, the component keeps using that menu while switching to signed-in UI. If `layout.header.menu` is empty, it falls back to the built-in signed-in menu: Find a job, Dashboard, Manage Account, and Sign out. Pass **`account-base-url`** when those fallback account links should use a non-production portal.

Handle **`wegAuthClick`** for sign-out (call your logout API, then redirect):

```tsx
import { useCallback, useState } from 'react';
import { useLocation } from 'react-router-dom';
import 'weg-shared-layout/weg-header';
import { dummyWeg21LayoutData } from 'weg-shared-layout/menus';
const layout = dummyWeg21LayoutData();

export function SiteHeader() {
  const { pathname, search } = useLocation();
  const currentPath = search ? `${pathname}${search}` : pathname;
  const [signedIn, setSignedIn] = useState(false);
  const userName = signedIn ? 'Alex' : undefined;

  const onAuthClick = useCallback(async (event: CustomEvent<{ action: 'sign-in' | 'sign-out' }>) => {
    if (event.detail.action !== 'sign-out') return;

    event.preventDefault();
    await logout();
    setSignedIn(false);
    window.location.assign('/');
  }, []);

  return (
    <weg-header
      layout={layout}
      signedIn={signedIn}
      currentPath={currentPath}
      {...(userName ? { userName } : {})}
      onWegAuthClick={onAuthClick}
    />
  );
}
```

Without React Router, pass `window.location.pathname` (+ `search` when needed) or your router’s equivalent.

| Prop / event | Purpose |
| --- | --- |
| `signedIn={boolean}` | Enables signed-in UI; the built-in signed-in fallback menu is used when `layout.header.menu` is empty |
| `userName={string}` | First name beside profile icon on Manage Account |
| `accountBaseUrl={string}` | Account portal origin for signed-in links (optional) |
| `currentPath={string}` | Current path — highlights active nav (e.g. `/career-advice/foo`) |
| `onWegAuthClick` | Required for sign-out — call logout API and redirect; sign-in follows link `href` |

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

## 4. Nav active state

Pass **`currentPath`** so the header highlights the current page. Use your router’s pathname; include the query string when matching dropdown links with search params (e.g. `/search?category=graduates`).

| Link type | Match rule |
| --- | --- |
| Flat nav link | Prefix — `/career-advice` matches `/career-advice/foo` |
| Dropdown child | Exact pathname (+ query when href includes `?`) |
| Dropdown parent | Active background when any child matches |
| Sign in / Sign out | Never highlighted |

Active links use **`weg-purple-200`** (`#CDCFF8`). Omit `currentPath` to disable active styling.

```tsx
import { useLocation } from 'react-router-dom';

const { pathname, search } = useLocation();
const currentPath = search ? `${pathname}${search}` : pathname;

<weg-header layout={layout} currentPath={currentPath} />
```

## 5. Production: fetch layout from your API

```tsx
import { useEffect, useState } from 'react';
import 'weg-shared-layout/weg-header';
import 'weg-shared-layout/weg-footer';
import { dummyWeg21LayoutData, fetchWeg21Layout } from 'weg-shared-layout/menus';
const layoutFixture = dummyWeg21LayoutData();

type LayoutData = typeof layoutFixture;

export function SiteLayout({ children }: { children: React.ReactNode }) {
  const [layout, setLayout] = useState<LayoutData | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchWeg21Layout({ apiKey: import.meta.env.VITE_WCMS_API_KEY })
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

Keep the mapped object shape aligned with `menusToLayoutData` output.

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
import { dummyWeg21LayoutData } from 'weg-shared-layout/menus';
const layoutFixture = dummyWeg21LayoutData();
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
| Signed-in links are not what you expected | `layout.header.menu` is still being used | Leave `layout.header.menu` empty if you want the built-in signed-in fallback nav. |
| Manage Account shows label not name | `user-name` not set | Pass `userName` when signed in. |
| Nav never highlights active page | `current-path` not set | Pass `currentPath` from your router (pathname + query when needed). |
| `onWegAuthClick` not firing | React CE event binding | Use `addEventListener` on a ref. |
| TS: unknown element | No augmentation | Add `weg-shared-layout-jsx.d.ts`. |

## See also

- **[Documentation index](./README.md)**
- **[Next.js App Router](./nextjs.md)**
- **[Angular](./angular.md)** · **[Angular 16 demo](../demo/angular16/README.md)**
- **[Plain HTML / vanilla JS](./vanilla.md)**
- **[Package readme](../readme.md)**
