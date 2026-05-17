# React (SPA)

Guide for **client-rendered** React apps (Vite, Create React App, etc.). If you use **Next.js App Router**, see **[Next.js](./nextjs.md)** — SSR and Server Components require a different integration.

## What is `<weg-footer>`?

`<weg-footer>` is a **presentational** [Stencil](https://stenciljs.com/) Web Component shipped by `weg-shared-layout`. It renders the site footer (social links, standard links, credits, copyright) from a **layout payload** you provide.

The component **does not fetch data**. Your app loads JSON (from an API, CMS, or a static file) and passes it on the `layout` property.

Payload shape matches [`dummy-data.json`](../src/assets/dummy-data.json) (see also [readme](../readme.md#how-it-works)).

## Requirements

| Requirement | Notes |
| --- | --- |
| **React 19+** | React 19 maps custom-element props to DOM **properties** when possible. Older React often sets `layout` as a string **attribute**, which breaks object payloads. |
| **Bundler** | Must resolve `node_modules` ESM/CJS from `weg-shared-layout`. |
| **TypeScript (optional)** | Module augmentation below; enable `resolveJsonModule` if you import `dummy-data.json`. |

## Install

```bash
npm i weg-shared-layout
# or
pnpm add weg-shared-layout
```

## 1. Register custom elements (once)

Call `defineCustomElements()` **once** before the first `<weg-footer>` render — typically in your app entry (`main.tsx`, `index.tsx`):

```ts
import { defineCustomElements } from 'weg-shared-layout/loader';

defineCustomElements();
```

Also side-effect import the tag so your bundler includes the component definition:

```ts
import 'weg-shared-layout/weg-footer';
```

**Alternative:** import only the footer bundle (no loader call):

```ts
import 'weg-shared-layout/weg-footer';
```

Use the loader when you may add more tags from this package later.

## 2. Render the footer

### Recommended: pass `layout` as an object (React 19+)

```tsx
import 'weg-shared-layout/weg-footer';
import layout from 'weg-shared-layout/dummy-data.json';

export function SiteFooter() {
  return <weg-footer layout={layout} />;
}
```

With React 19+, `layout={layoutObject}` is applied as the custom element’s **`layout` property** (object), which `<weg-footer>` expects.

### Fallback: `JSON.stringify` (all React versions)

If you are on React 18 or see an empty footer despite correct data, pass a JSON **string**. The component parses string values the same as objects:

```tsx
<weg-footer layout={JSON.stringify(layout)} />
```

### Plain HTML attribute

Outside React, you can set `layout='{"footer":{...}}'` on the element. Prefer the property in SPA code.

## 3. Production: fetch layout from your API

Example using the public test API (same shape as `dummy-data.json`):

```tsx
import { useEffect, useState } from 'react';
import 'weg-shared-layout/weg-footer';
import layoutFixture from 'weg-shared-layout/dummy-data.json';

type LayoutData = typeof layoutFixture;

const LAYOUT_URL = 'https://weg-payload-test.vercel.app/api/layout';

export function SiteFooter() {
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

  if (!layout) return null; // or a skeleton

  return <weg-footer layout={layout} />;
}
```

Replace the URL with your own CMS/API. Keep the object shape aligned with `dummy-data.json`.

## TypeScript: module augmentation

Do **not** rely on a triple-slash reference in every file. Augment React’s JSX namespace once (e.g. `src/types/weg-shared-layout-jsx.d.ts`):

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

Ensure that file is included by your `tsconfig.json` `include`/`files`.

Enable in `tsconfig.json` when importing JSON fixtures:

```json
{
  "compilerOptions": {
    "resolveJsonModule": true
  }
}
```

## `layout` prop vs attribute (why React version matters)

| How data is set | Works with object? |
| --- | --- |
| **Property** `el.layout = obj` / React 19 `layout={obj}` | Yes |
| **Attribute** `layout="[object Object]"` / React 18 `layout={obj}` | No — footer stays empty |
| **Attribute** `layout='{"footer":...}'` / `layout={JSON.stringify(obj)}` | Yes — component parses JSON |

`<weg-footer>` accepts `layout` as either an object or a JSON string (see `parseJsonProp` in the component source).

## Note: `prop:layout` is unreliable in React

Some examples set Stencil props with a `prop:` prefix (e.g. `prop:layout={data}`). In React this is **not dependable** — behavior varies by version and reconciler. Prefer:

1. **`layout={object}`** on React 19+, or  
2. **`layout={JSON.stringify(object)}`**, or  
3. **Ref fallback** after mount:

```tsx
import { useEffect, useRef } from 'react';
import type layoutFixture from 'weg-shared-layout/dummy-data.json';

type LayoutData = typeof layoutFixture;

export function SiteFooter({ layout }: { layout: LayoutData }) {
  const ref = useRef<HTMLWegFooterElement>(null);

  useEffect(() => {
    if (ref.current) ref.current.layout = layout;
  }, [layout]);

  return <weg-footer ref={ref} />;
}
```

## Troubleshooting

| Symptom | Likely cause | Fix |
| --- | --- | --- |
| Empty footer, no errors | `defineCustomElements()` not called, or missing `import 'weg-shared-layout/weg-footer'` | Register loader + import tag in entry before render. |
| Empty footer, data looks correct | React set `layout` as attribute (`[object Object]`) | Upgrade to React 19+, or use `layout={JSON.stringify(layout)}` or ref assignment. |
| TypeScript: `'weg-footer' does not exist on JSX.IntrinsicElements` | No module augmentation | Add `weg-shared-layout-jsx.d.ts` as above. |
| Cannot find module `weg-shared-layout/dummy-data.json` | `resolveJsonModule` off | Enable in `tsconfig.json`. |
| Footer flashes then disappears | Strict Mode double-mount + async layout | Ensure stable `layout` reference; avoid resetting state on remount. |
| Styles missing | Shadow DOM is encapsulated | Footer ships its own CSS; do not expect global site styles inside the shadow root. |

## See also

- **[Next.js App Router](./nextjs.md)** — Server Components, `transpilePackages`, hydration
- **[Angular](./angular.md)**
- **[Plain HTML / vanilla JS](./vanilla.md)**
- **[Package readme](../readme.md)**
