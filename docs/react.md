# React (SPA)

Guide for **client-rendered** React apps (Vite, Create React App, etc.). If you use **Next.js App Router**, see **[Next.js](./nextjs.md)** — SSR and Server Components require a different integration.

## Components

| Tag | Purpose |
| --- | --- |
| `<weg-header>` | Site header — logo (bundled), nav dropdowns, flat links, Sign in / Sign out |
| `<weg-footer>` | Site footer — social links, columns, credits, copyright |

Both are **presentational** [Stencil](https://stenciljs.com/) Web Components. They **do not fetch data** — your app passes a **`layout`** payload (API, CMS, or [`dummy-data.json`](../src/assets/dummy-data.json)).

`<weg-header>` additionally accepts **`signed-in`** and emits **`wegAuthClick`** for auth handling.

## Requirements

| Requirement | Notes |
| --- | --- |
| **React 19+** | React 19 maps custom-element props to DOM **properties** when possible. Older React often sets props as string **attributes**, which breaks object payloads. |
| **Bundler** | Must resolve `node_modules` ESM/CJS from `weg-shared-layout`. |
| **TypeScript (optional)** | Module augmentation below; enable `resolveJsonModule` if you import `dummy-data.json`. |

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

Side-effect import the tags your app uses:

```ts
import 'weg-shared-layout/weg-header';
import 'weg-shared-layout/weg-footer';
```

**Alternative:** import individual tag bundles only (no loader):

```ts
import 'weg-shared-layout/weg-header';
import 'weg-shared-layout/weg-footer';
```

Use the loader when you may add more tags from this package later.

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

The WEG logo is bundled inside `<weg-header>` — not configurable via `layout`.

Configure labels in `layout.header`:

```json
"signIn": { "label": "Sign in", "href": "/account/login" },
"signOut": { "label": "Sign out" }
```

Set **`signed-in`** from your session state and listen for **`wegAuthClick`**:

```tsx
import { useCallback, useState } from 'react';
import 'weg-shared-layout/weg-header';
import layout from 'weg-shared-layout/dummy-data.json';

export function SiteHeader() {
  const [signedIn, setSignedIn] = useState(false);

  const onAuthClick = useCallback((event: CustomEvent<{ action: 'sign-in' | 'sign-out' }>) => {
    event.preventDefault();

    if (event.detail.action === 'sign-out') {
      // your logout(), then:
      setSignedIn(false);
      return;
    }

    window.location.href = '/account/login';
  }, []);

  return (
    <weg-header
      layout={layout}
      signed-in={signedIn}
      // @ts-expect-error Stencil custom event
      onWegAuthClick={onAuthClick}
    />
  );
}
```

| Prop / event | Purpose |
| --- | --- |
| `signed-in={boolean}` | Shows Sign out when `true` |
| `onWegAuthClick` | Host handles routing / logout; call `event.preventDefault()` to override defaults |

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

return <weg-header ref={ref} layout={layout} signed-in={signedIn} />;
```

Update `signedIn` via `ref.current.signedIn = true` if property binding is unreliable.

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

## TypeScript: module augmentation

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

Enable in `tsconfig.json` when importing JSON fixtures:

```json
{
  "compilerOptions": {
    "resolveJsonModule": true
  }
}
```

## `layout` prop vs attribute

| How data is set | Works with object? |
| --- | --- |
| **Property** `el.layout = obj` / React 19 `layout={obj}` | Yes |
| **Attribute** `layout="[object Object]"` / React 18 `layout={obj}` | No — components stay empty |
| **Attribute** `layout={JSON.stringify(obj)}` | Yes — component parses JSON |

Both components accept `layout` as an object or JSON string.

## Note: `prop:layout` is unreliable in React

Prefer `layout={object}`, `layout={JSON.stringify(object)}`, or ref assignment — not `prop:layout`.

## Troubleshooting

| Symptom | Likely cause | Fix |
| --- | --- | --- |
| Empty header/footer | Loader/tag import missing | `defineCustomElements()` + `import 'weg-shared-layout/weg-header'` (and footer). |
| Empty despite correct data | React set `layout` as attribute | React 19+, or `JSON.stringify`, or ref assignment. |
| Logo missing on header | Old build without inlined logo | Upgrade package; logo is bundled in `logo-data.ts`. |
| Auth always Sign in | `signed-in` not set | Bind `signed-in={!!session}`. |
| `onWegAuthClick` not firing | React CE event binding | Use `addEventListener` on a ref (see above). |
| TS: unknown element | No augmentation | Add `weg-shared-layout-jsx.d.ts`. |

## See also

- **[Next.js App Router](./nextjs.md)**
- **[Angular](./angular.md)**
- **[Plain HTML / vanilla JS](./vanilla.md)**
- **[Package readme](../readme.md)**
