[![Built With Stencil](https://img.shields.io/badge/-Built%20With%20Stencil-16161d.svg?logo=data%3Aimage%2Fsvg%2Bxml%3Bbase64%2CPD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4KPCEtLSBHZW5lcmF0b3I6IEFkb2JlIElsbHVzdHJhdG9yIDE5LjIuMSwgU1ZHIEV4cG9ydCBQbHVnLUluIC4gU1ZHIFZlcnNpb246IDYuMDAgQnVpbGQgMCkgIC0tPgo8c3ZnIHZlcnNpb249IjEuMSIgaWQ9IkxheWVyXzEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHg9IjBweCIgeT0iMHB4IgoJIHZpZXdCb3g9IjAgMCA1MTIgNTEyIiBzdHlsZT0iZW5hYmxlLWJhY2tncm91bmQ6bmV3IDAgMCA1MTIgNTEyOyIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSI%2BCjxzdHlsZSB0eXBlPSJ0ZXh0L2NzcyI%2BCgkuc3Qwe2ZpbGw6I0ZGRkZGRjt9Cjwvc3R5bGU%2BCjxwYXRoIGNsYXNzPSJzdDAiIGQ9Ik00MjQuNywzNzMuOWMwLDM3LjYtNTUuMSw2OC42LTkyLjcsNjguNkgxODAuNGMtMzcuOSwwLTkyLjctMzAuNy05Mi43LTY4LjZ2LTMuNmgzMzYuOVYzNzMuOXoiLz4KPHBhdGggY2xhc3M9InN0MCIgZD0iTTQyNC43LDI5Mi4xSDE4MC40Yy0zNy42LDAtOTIuNy0zMS05Mi43LTY4LjZ2LTMuNkgzMzJjMzcuNiwwLDkyLjcsMzEsOTIuNyw2OC42VjI5Mi4xeiIvPgo8cGF0aCBjbGFzcz0ic3QwIiBkPSJNNDI0LjcsMTQxLjdIODcuN3YtMy42YzAtMzcuNiw1NC44LTY4LjYsOTIuNy02OC42SDMzMmMzNy45LDAsOTIuNywzMC43LDkyLjcsNjguNlYxNDEuN3oiLz4KPC9zdmc%2BCg%3D%3D&colorA=16161d&style=flat-square)](https://stenciljs.com)

# weg-shared-layout

> Shared layout Web Components (Stencil).

Install:

```bash
npm i weg-shared-layout
```

## Using in Angular

Register custom elements (recommended in `main.ts`):

```ts
import { defineCustomElements } from 'weg-shared-layout/loader';

defineCustomElements();
```

Allow custom elements in the module that uses them:

```ts
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';

@NgModule({
  // ...
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class AppModule {}
```

Use in a template (standard):

```html
<weg-footer
  variant="standard"
  company-name="WEG"
  company-number="12345678"
  social-links-src="/assets/footer-social-links.json"
  standard-links-src="/assets/footer-standard-links.json"
></weg-footer>
```

Use in a template (additional):

```html
<weg-footer
  variant="additional"
  company-name="WEG"
  company-number="12345678"
  social-links-src="/assets/footer-social-links.json"
  additional-groups-src="/assets/footer-additional-groups.json"
></weg-footer>
```

## Using in React

Install:

```bash
npm i weg-shared-layout
```

Register custom elements (pick one):

```ts
// Option A (recommended): loader registers all components
import { defineCustomElements } from 'weg-shared-layout/loader';

defineCustomElements();
```

Or:

```ts
// Option B: import package bundle (also registers, depending on output target configuration)
import 'weg-shared-layout';
```

### Next.js (App Router) note

Stencil custom elements must be registered **in the browser**. If you’re using Next.js `app/` (App Router), don’t import/register Stencil components from a Server Component.

Instead, register them in a Client Component, for example:

```tsx
// app/components/WegFooterClient.tsx
"use client";

import "weg-shared-layout/weg-footer";

export function WegFooterClient() {
  return (
    <weg-footer
      variant="standard"
      company-name="WEG"
      company-number="12345678"
      social-links-src="/assets/footer-social-links.json"
      standard-links-src="/assets/footer-standard-links.json"
    />
  );
}
```

Use the footer (standard):

```tsx
import 'weg-shared-layout/weg-footer';

export function App() {
  return (
    <weg-footer
      variant="standard"
      company-name="WEG"
      company-number="12345678"
      social-links-src="/assets/footer-social-links.json"
      standard-links-src="/assets/footer-standard-links.json"
    />
  );
}
```

Use the footer (additional):

```tsx
import 'weg-shared-layout/weg-footer';

export function App() {
  return (
    <weg-footer
      variant="additional"
      company-name="WEG"
      company-number="12345678"
      social-links-src="/assets/footer-social-links.json"
      additional-groups-src="/assets/footer-additional-groups.json"
    />
  );
}
```

### React TypeScript typings

Stencil generates `components.d.ts` in this repo, but React does not automatically pick up custom element typings. In consuming React apps, add a `global.d.ts` (or similar) that references your package’s generated types:

```ts
/// <reference types="weg-shared-layout/dist/types/components" />
```

If your app still complains about JSX intrinsic elements, you can also augment `JSX.IntrinsicElements` in that same file (varies by React/TS setup).

### Note on `*-src` JSON URLs

`social-links-src`, `standard-links-src`, and `additional-groups-src` are fetched by the component at runtime, so the JSON files must be **served by the host app** (e.g. Angular’s `src/assets/`), or be a full `https://...` URL.