[![Built With Stencil](https://img.shields.io/badge/-Built%20With%20Stencil-16161d.svg?logo=data%3Aimage%2Fsvg%2Bxml%3Bbase64%2CPD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4KPCEtLSBHZW5lcmF0b3I6IEFkb2JlIElsbHVzdHJhdG9yIDE5LjIuMSwgU1ZHIEV4cG9ydCBQbHVnLUluIC4gU1ZHIFZlcnNpb246IDYuMDAgQnVpbGQgMCkgIC0tPgo8c3ZnIHZlcnNpb249IjEuMSIgaWQ9IkxheWVyXzEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHg9IjBweCIgeT0iMHB4IgoJIHZpZXdCb3g9IjAgMCA1MTIgNTEyIiBzdHlsZT0iZW5hYmxlLWJhY2tncm91bmQ6bmV3IDAgMCA1MTIgNTEyOyIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSI%2BCjxzdHlsZSB0eXBlPSJ0ZXh0L2NzcyI%2BCgkuc3Qwe2ZpbGw6I0ZGRkZGRjt9Cjwvc3R5bGU%2BCjxwYXRoIGNsYXNzPSJzdDAiIGQ9Ik00MjQuNywzNzMuOWMwLDM3LjYtNTUuMSw2OC42LTkyLjcsNjguNkgxODAuNGMtMzcuOSwwLTkyLjctMzAuNy05Mi43LTY4LjZ2LTMuNmgzMzYuOVYzNzMuOXoiLz4KPHBhdGggY2xhc3M9InN0MCIgZD0iTTQyNC43LDI5Mi4xSDE4MC40Yy0zNy42LDAtOTIuNy0zMS05Mi43LTY4LjZ2LTMuNkgzMzJjMzcuNiwwLDkyLjcsMzEsOTIuNyw2OC42VjI5Mi4xeiIvPgo8cGF0aCBjbGFzcz0ic3QwIiBkPSJNNDI0LjcsMTQxLjdIODcuN3YtMy42YzAtMzcuNiw1NC44LTY4LjYsOTIuNy02OC42SDMzMmMzNy45LDAsOTIuNywzMC43LDkyLjcsNjguNlYxNDEuN3oiLz4KPC9zdmc%2BCg%3D%3D&colorA=16161d&style=flat-square)](https://stenciljs.com)

# weg-shared-layout

> Shared layout Web Components (Stencil).

Install:

```bash
npm i weg-shared-layout
```

## How it works

`<weg-footer>` is a **dumb / presentational** Web Component. It does **not** fetch data itself. Your host app calls the layout API, then passes the resulting object into the component via the `data` prop.

This keeps the component framework-agnostic, lets you share the same response with `<weg-header>` (coming soon), and means HTTP concerns like auth, caching, retries, SSR, and error handling live in your app — where they belong.

## Layout API

Call this endpoint from your host app to retrieve the data:

```
GET https://weg-payload-test.vercel.app/api/layout
```

Response shape:

```json
{
  "header": {},
  "footer": {
    "social": [
      { "platform": "LinkedIn", "href": "https://www.linkedin.com/" },
      { "platform": "Instagram", "href": "https://www.instagram.com/" },
      { "platform": "TikTok", "href": "https://www.tiktok.com/" },
      { "platform": "YouTube", "href": "https://www.youtube.com/" }
    ],
    "standardLinks": [
      { "label": "About Us", "href": "/about" },
      { "label": "Privacy Policy", "href": "/privacy" },
      { "label": "Terms of Use", "href": "/terms" },
      { "label": "Cookie Policy", "href": "/cookies" },
      { "label": "Accessibility Statement", "href": "/accessibility" }
    ],
    "credits": "Warwick Employment Group is a department of the Campus and Commercial Services Group at the University of Warwick.",
    "copyright": "Copyright © Warwick Employment Group."
  }
}
```

Only `social.platform` values of `LinkedIn`, `Instagram`, `TikTok`, and `YouTube` render an icon. Items with missing/invalid fields are silently dropped.

## Using in Angular

This guide assumes a modern Angular project (v17+, **standalone components**) — the default for `ng new`. There's an `NgModule` section further down for older apps.

### 1. Install the package

```bash
npm i weg-shared-layout
# or: pnpm add weg-shared-layout
# or: yarn add weg-shared-layout
```

### 2. Register the custom elements (once, at startup)

Stencil ships a loader that calls `customElements.define()` for every component in the package. Call it **once** before Angular bootstraps your app, otherwise the browser sees `<weg-footer>` as an unknown element and renders nothing.

Edit `src/main.ts`:

```ts
import { bootstrapApplication } from '@angular/platform-browser';
import { defineCustomElements } from 'weg-shared-layout/loader';

import { appConfig } from './app/app.config';
import { App } from './app/app';

// MUST run before bootstrapApplication so the browser recognises <weg-footer>
// by the time Angular's renderer touches the DOM.
defineCustomElements();

bootstrapApplication(App, appConfig).catch((err) => console.error(err));
```

> If you don't see your footer in the page, 9 times out of 10 it's because this step was skipped. Verify by typing `customElements.get('weg-footer')` in the browser DevTools console — it should return a class, not `undefined`.

### 3. Provide `HttpClient`

You need `HttpClient` to call the layout API. In `src/app/app.config.ts`:

```ts
import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(),
  ],
};
```

### 4. Tell Angular to allow unknown elements

Without this, Angular's template compiler throws:

> `'weg-footer' is not a known element: ... If 'weg-footer' is a Web Component then add 'CUSTOM_ELEMENTS_SCHEMA' to the '@Component.schemas' of this component to suppress this message.`

In **standalone components** (default in Angular 17+), add `schemas: [CUSTOM_ELEMENTS_SCHEMA]` to the `@Component` decorator of **every component that uses `<weg-footer>` in its template**. Easiest is to add it to your root `App` component:

```ts
// src/app/app.ts
import { Component, CUSTOM_ELEMENTS_SCHEMA, inject, OnInit, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { RouterOutlet } from '@angular/router';

const LAYOUT_API = 'https://weg-payload-test.vercel.app/api/layout';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements OnInit {
  protected readonly layoutData = signal<unknown>(null);

  private readonly http = inject(HttpClient);

  ngOnInit(): void {
    this.http.get(LAYOUT_API).subscribe({
      next: (data) => this.layoutData.set(data),
      error: (err) => console.error('Failed to load layout data', err),
    });
  }
}
```

> `CUSTOM_ELEMENTS_SCHEMA` is **per-component** in standalone Angular. If you use `<weg-footer>` inside a child component's template, that child must declare `schemas: [CUSTOM_ELEMENTS_SCHEMA]` too. It does **not** cascade through `<router-outlet />`.

### 5. Pass the data into `<weg-footer>` via the `[data]` binding

In `src/app/app.html`:

```html
<router-outlet />

<weg-footer [data]="layoutData()"></weg-footer>
```

That's the whole integration. `<weg-footer>` watches its `data` prop and re-renders when the signal value changes (e.g. when the HTTP response arrives), so an initial `null` is fine — the footer will simply render empty until the data lands.

#### Why `[data]` and not `data-src` or `[attr.data]`

- `[data]="..."` is Angular's **property binding** — it sets the JS property `data` on the underlying DOM element. Stencil exposes `@Prop()` values as JS properties, so this passes the object straight through. **This is what you want.**
- `[attr.data]="..."` would set an HTML attribute, which is always a string — Angular would call `JSON.stringify(layoutData)` for you, the component would have to parse it back, and you'd lose type fidelity. Avoid unless you have a reason.
- Plain `data="..."` only works for a static string literal and would have the same parsing cost — fine for testing, not for real data.

### 6. Verify it works

After running `ng serve`, open the page and check:

1. The dark footer bar renders at the bottom of the page.
2. DevTools → Network tab shows a `200 OK` to `https://weg-payload-test.vercel.app/api/layout`.
3. DevTools → Elements → click `<weg-footer>` → in the Console, type `$0.data` — you should see the JSON object you fetched.
4. Expand `<weg-footer>` in the Elements panel — you should see a `#shadow-root (open)` containing the actual `<footer>` markup.

### Troubleshooting

| Symptom | Cause / fix |
| --- | --- |
| `'weg-footer' is not a known element` build error | Add `schemas: [CUSTOM_ELEMENTS_SCHEMA]` to the `@Component` decorator of the component whose template uses `<weg-footer>`. |
| Element renders as plain inline text / empty box | `defineCustomElements()` was never called. Add it to `main.ts` **before** `bootstrapApplication`. |
| Footer is in the DOM but blank | The HTTP request failed or returned the wrong shape. Check DevTools → Network → confirm the response matches the [API shape](#layout-api). Also inspect `$0.data` in the console to confirm the binding made it onto the element. |
| `NullInjectorError: No provider for HttpClient` | You forgot `provideHttpClient()` in `app.config.ts`. |
| CORS error in the console | The API host must allow your origin. Either fix CORS on the backend, or proxy through Angular's dev proxy (`proxy.conf.json`) so the call becomes same-origin. |
| Footer doesn't update after data changes | Make sure you're using `[data]="layoutData()"` with a signal (or `[data]="layoutData$ | async"` with an Observable) so Angular pushes new values into the element. |
| Works locally, fails in SSR (`document is not defined`) | `defineCustomElements()` touches `window` / `customElements`. Wrap in `if (typeof window !== 'undefined') { ... }` or use `isPlatformBrowser(platformId)` in `main.ts`. |
| TypeScript: `Property 'weg-footer' does not exist on type 'HTMLElementTagNameMap'` | See the typings section below. |

### TypeScript typings (Angular)

If your editor / TS service complains about the unknown element or the `[data]` binding, add this to `src/global.d.ts` (creating the file if needed) and make sure it's included by `tsconfig.json`:

```ts
/// <reference types="weg-shared-layout/dist/types/components" />
```

### Legacy: using with `NgModule`

If your app is still using `NgModule` (pre-Angular 17 default), add `CUSTOM_ELEMENTS_SCHEMA` once at the module level instead of per component:

```ts
// src/app/app.module.ts
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';

@NgModule({
  imports: [HttpClientModule /* ... */],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class AppModule {}
```

`defineCustomElements()` in `main.ts` is still required either way. Inject `HttpClient` in your component the same way as the standalone example above.

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

Then fetch the data in your component and pass it in via a ref (because the `data` prop is an object, not a string attribute):

```tsx
import { useEffect, useRef, useState } from 'react';
import 'weg-shared-layout/weg-footer';

const LAYOUT_API = 'https://weg-payload-test.vercel.app/api/layout';

export function SiteFooter() {
  const ref = useRef<HTMLElement>(null);
  const [layout, setLayout] = useState<unknown>(null);

  useEffect(() => {
    fetch(LAYOUT_API).then((r) => r.json()).then(setLayout);
  }, []);

  useEffect(() => {
    if (ref.current) (ref.current as any).data = layout;
  }, [layout]);

  return <weg-footer ref={ref} />;
}
```

> React (pre-19) sets unknown JSX attributes as HTML attributes, which would stringify your object. Assigning via a ref guarantees you set the JS property. React 19+ handles this correctly without the ref dance.

### Next.js (App Router) note

Stencil custom elements must be registered **in the browser**. In Next.js `app/` (App Router), don't import/register Stencil components from a Server Component.

Instead, register them in a Client Component, for example:

```tsx
// app/components/SiteFooter.tsx
"use client";

import { useEffect, useRef, useState } from 'react';
import 'weg-shared-layout/weg-footer';

export function SiteFooter() {
  const ref = useRef<HTMLElement>(null);
  const [layout, setLayout] = useState<unknown>(null);

  useEffect(() => {
    fetch('/api/layout').then((r) => r.json()).then(setLayout);
  }, []);

  useEffect(() => {
    if (ref.current) (ref.current as any).data = layout;
  }, [layout]);

  return <weg-footer ref={ref} />;
}
```

(You can also fetch in a Server Component and pass `layout` down as a prop to the Client Component — but the actual `data` assignment still has to happen in the browser.)

### React TypeScript typings

Stencil generates `components.d.ts`, but React doesn't pick up custom element typings automatically. Add a `global.d.ts` that references the generated types:

```ts
/// <reference types="weg-shared-layout/dist/types/components" />
```

If your app still complains about JSX intrinsic elements, you can also augment `JSX.IntrinsicElements` in that same file (varies by React/TS setup).

## Plain HTML / vanilla JS

For a quick smoke test outside of a framework, fetch the JSON and assign it to the element's `data` property:

```html
<weg-footer id="footer"></weg-footer>

<script type="module">
  const res = await fetch('https://weg-payload-test.vercel.app/api/layout');
  document.getElementById('footer').data = await res.json();
</script>
```

You can also pass the JSON as a string attribute — useful for SSR or static HTML where you don't want a runtime fetch:

```html
<weg-footer data='{"footer":{"social":[],"standardLinks":[],"credits":"","copyright":"Copyright © WEG."}}'></weg-footer>
```

## CORS

Because the host app calls the API directly, **the API must respond with `Access-Control-Allow-Origin` headers** that include your app's origin. If you hit a CORS error in the browser console, either:

- Fix CORS on the API host, **or**
- Proxy the call through your own host. Angular: configure `proxy.conf.json` so `/api/layout` is rewritten to the production URL. Next.js: add a route handler that re-fetches and returns the JSON.
