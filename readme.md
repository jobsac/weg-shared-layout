[![Built With Stencil](https://img.shields.io/badge/-Built%20With%20Stencil-16161d.svg?logo=data%3Aimage%2Fsvg%2Bxml%3Bbase64%2CPD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4KPCEtLSBHZW5lcmF0b3I6IEFkb2JlIElsbHVzdHJhdG9yIDE5LjIuMSwgU1ZHIEV4cG9ydCBQbHVnLUluIC4gU1ZHIFZlcnNpb246IDYuMDAgQnVpbGQgMCkgIC0tPgo8c3ZnIHZlcnNpb249IjEuMSIgaWQ9IkxheWVyXzEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHg9IjBweCIgeT0iMHB4IgoJIHZpZXdCb3g9IjAgMCA1MTIgNTEyIiBzdHlsZT0iZW5hYmxlLWJhY2tncm91bmQ6bmV3IDAgMCA1MTIgNTEyOyIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSI%2BCjxzdHlsZSB0eXBlPSJ0ZXh0L2NzcyI%2BCgkuc3Qwe2ZpbGw6I0ZGRkZGRjt9Cjwvc3R5bGU%2BCjxwYXRoIGNsYXNzPSJzdDAiIGQ9Ik00MjQuNywzNzMuOWMwLDM3LjYtNTUuMSw2OC42LTkyLjcsNjguNkgxODAuNGMtMzcuOSwwLTkyLjctMzAuNy05Mi43LTY4LjZ2LTMuNmgzMzYuOVYzNzMuOXoiLz4KPHBhdGggY2xhc3M9InN0MCIgZD0iTTQyNC43LDI5Mi4xSDE4MC40Yy0zNy42LDAtOTIuNy0zMS05Mi43LTY4LjZ2LTMuNkgzMzJjMzcuNiwwLDkyLjcsMzEsOTIuNyw2OC42VjI5Mi4xeiIvPgo8cGF0aCBjbGFzcz0ic3QwIiBkPSJNNDI0LjcsMTQxLjdIODcuN3YtMy42YzAtMzcuNiw1NC44LTY4LjYsOTIuNy02OC42SDMzMmMzNy45LDAsOTIuNywzMC43LDkyLjcsNjguNlYxNDEuN3oiLz4KPC9zdmc%2BCg%3D%3D&colorA=16161d&style=flat-square)](https://stenciljs.com)

# weg-shared-layout

> Shared layout Web Components (Stencil).

Install:

```bash
npm i weg-shared-layout
```

## How it works

`<weg-footer>` is a **presentational** Web Component: it does **not** fetch data. Your app loads layout data however you like (REST, GraphQL, SSR, etc.), then passes the object into the component via the **`data` property** (not a string HTML attribute).

The payload shape matches the sample file **`dummy-data.json`**, shipped with the package:

- **Import:** `import layout from 'weg-shared-layout/dummy-data.json'` (enable `resolveJsonModule` in TypeScript if needed).
- **In this repo:** [`src/assets/dummy-data.json`](src/assets/dummy-data.json)

Use that JSON as fixture data to see the footer working, or as a reference for your own API responses. Only `social.platform` values `LinkedIn`, `Instagram`, `TikTok`, and `YouTube` render an icon; items with missing or invalid fields are dropped.

## Using in Angular

Assumes Angular 17+ with **standalone** components (default for `ng new`).

### 1. Install

```bash
npm i weg-shared-layout
```

### 2. Register custom elements (once, before bootstrap)

In `src/main.ts`, call `defineCustomElements()` **before** `bootstrapApplication` so the browser recognises `<weg-footer>`.

```ts
import { bootstrapApplication } from '@angular/platform-browser';
import { defineCustomElements } from 'weg-shared-layout/loader';

import { appConfig } from './app/app.config';
import { App } from './app/app';

defineCustomElements();

bootstrapApplication(App, appConfig).catch((err) => console.error(err));
```

### 3. Allow custom elements in templates

Add `schemas: [CUSTOM_ELEMENTS_SCHEMA]` to every `@Component` whose template uses `<weg-footer>` (it does not cascade from the root through `router-outlet` children).

### 4. Pass data with property binding

Use **`[data]="..."`** so Angular sets the element’s JavaScript `data` property (Stencil `@Prop()`), not an HTML attribute.

Example with the bundled sample payload:

```ts
// src/app/app.ts
import { Component, CUSTOM_ELEMENTS_SCHEMA, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import layoutFixture from 'weg-shared-layout/dummy-data.json';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly layoutData = signal(layoutFixture);
}
```

```html
<!-- src/app/app.html -->
<router-outlet />
<weg-footer [data]="layoutData()"></weg-footer>
```

In production, replace `layoutFixture` with data from your own services; keep the same object shape as `dummy-data.json`.

### Troubleshooting

| Symptom | Cause / fix |
| --- | --- |
| `'weg-footer' is not a known element` | Add `schemas: [CUSTOM_ELEMENTS_SCHEMA]` on the component whose template contains `<weg-footer>`. |
| Footer missing or empty box | `defineCustomElements()` not called before bootstrap, or `data` not set / wrong shape — compare with `dummy-data.json`. |
| SSR: `document is not defined` | Guard `defineCustomElements()` with `typeof window !== 'undefined'` or `isPlatformBrowser`. |

### TypeScript typings

```ts
/// <reference types="weg-shared-layout/dist/types/components" />
```

### Legacy `NgModule`

Add `CUSTOM_ELEMENTS_SCHEMA` once on the module that declares components using `<weg-footer>`. `defineCustomElements()` in `main.ts` is still required.

## Using in React

Register once (for example in your app entry):

```ts
import { defineCustomElements } from 'weg-shared-layout/loader';

defineCustomElements();
```

Pass an object via a **ref** (or use React 19+ property handling) so you set the DOM property, not a string attribute:

```tsx
import { useEffect, useRef, useState } from 'react';
import 'weg-shared-layout/weg-footer';
import layoutFixture from 'weg-shared-layout/dummy-data.json';

export function SiteFooter() {
  const ref = useRef<HTMLElement & { data?: unknown }>(null);
  const [layout, setLayout] = useState(layoutFixture);

  useEffect(() => {
    if (ref.current) ref.current.data = layout;
  }, [layout]);

  return <weg-footer ref={ref} />;
}
```

Swap `layoutFixture` / `setLayout` for your own data loading. **Next.js App Router:** register and assign `data` only in a Client Component (`"use client"`).

### React TypeScript

```ts
/// <reference types="weg-shared-layout/dist/types/components" />
```

## Plain HTML / vanilla JS

With a bundler that resolves `node_modules` imports:

```html
<weg-footer id="footer"></weg-footer>
<script type="module">
  import { defineCustomElements } from 'weg-shared-layout/loader';
  import layout from 'weg-shared-layout/dummy-data.json';

  defineCustomElements();
  document.getElementById('footer').data = layout;
</script>
```

Otherwise, copy `dummy-data.json` to your static assets, `fetch` it, parse JSON, then assign **`element.data`**. You can also pass a JSON string on the **`data` attribute**; the component parses it the same way as an object `data` property.
