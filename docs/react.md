# React

## Register custom elements

Run once (for example in `main.tsx` / your app entry):

```ts
import { defineCustomElements } from 'weg-shared-layout/loader';

defineCustomElements();
```

## Pass layout data

Import the fixture (or your own object with the same shape) and pass it on **`data`**:

```tsx
import 'weg-shared-layout/weg-footer';
import layout from 'weg-shared-layout/dummy-data.json';

export function SiteFooter() {
  return <weg-footer data={layout} />;
}
```

Use **React 19 or newer** so `data={...}` is applied as the custom element’s **`data` property** (object), not a string attribute.

**Next.js App Router:** keep registration and this JSX in a **Client Component** (`"use client"`).

## TypeScript

```ts
/// <reference types="weg-shared-layout/dist/types/components" />
```

Enable `resolveJsonModule` in `tsconfig.json` if you import `dummy-data.json`.
