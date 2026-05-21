# Angular

Assumes Angular 17+ with **standalone** components (default for `ng new`).

## Components

| Tag | Import (optional, no loader) |
| --- | --- |
| `<weg-header>` | `import 'weg-shared-layout/weg-header';` |
| `<weg-footer>` | `import 'weg-shared-layout/weg-footer';` |

Both accept the same `layout` payload ([`dummy-data.json`](../src/assets/dummy-data.json)). `<weg-header>` also accepts **`signed-in`** and emits **`wegAuthClick`**.

## 1. Install

```bash
npm i weg-shared-layout
```

## 2. Register custom elements (once, before bootstrap)

In `src/main.ts`, call `defineCustomElements()` **before** `bootstrapApplication`:

```ts
import { bootstrapApplication } from '@angular/platform-browser';
import { defineCustomElements } from 'weg-shared-layout/loader';

import { appConfig } from './app/app.config';
import { App } from './app/app';

defineCustomElements();

bootstrapApplication(App, appConfig).catch((err) => console.error(err));
```

If `defineCustomElements` is async in your Stencil build, `await` it before bootstrapping.

**Alternative:** side-effect import only the tags you need (no loader call):

```ts
import 'weg-shared-layout/weg-header';
import 'weg-shared-layout/weg-footer';
```

## 3. Allow custom elements in templates

Add `schemas: [CUSTOM_ELEMENTS_SCHEMA]` to every `@Component` whose template uses `<weg-header>` or `<weg-footer>` (does not cascade through `router-outlet` children).

## 4. Layout shell example

Use **`[layout]="..."`** so Angular sets the JavaScript `layout` property, not an HTML attribute.

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
  protected readonly signedIn = signal(false);

  protected onAuthClick(event: Event) {
    const customEvent = event as CustomEvent<{ action: 'sign-in' | 'sign-out' }>;
    customEvent.preventDefault();

    if (customEvent.detail.action === 'sign-out') {
      // call your logout service
      this.signedIn.set(false);
      return;
    }

    // navigate to sign-in, e.g. inject Router
    window.location.href = '/account/login';
  }
}
```

```html
<!-- src/app/app.html -->
<weg-header
  [layout]="layoutData()"
  [signedIn]="signedIn()"
  (wegAuthClick)="onAuthClick($event)"
></weg-header>

<router-outlet />

<weg-footer [layout]="layoutData()"></weg-footer>
```

Enable `resolveJsonModule` in `tsconfig.app.json` if you import `dummy-data.json`.

In production, replace `layoutFixture` with data from your services; keep the same object shape.

## Header: `signed-in` and `wegAuthClick`

| Input / output | Binding | Notes |
| --- | --- | --- |
| Session state | `[signedIn]="signedIn()"` | When `true`, shows `layout.header.signOut` instead of `signIn` |
| Auth click | `(wegAuthClick)="onAuthClick($event)"` | `event.detail.action` is `'sign-in'` or `'sign-out'` |
| Prevent default | `event.preventDefault()` in handler | Stops link navigation / `signOut.href` redirect |

Logo is bundled in the component — not configurable via `layout`.

## Footer

`<weg-footer>` only needs `[layout]`. See [`dummy-data.json`](../src/assets/dummy-data.json) for the `footer` shape (social, columns, credits, copyright).

## Troubleshooting

| Symptom | Cause / fix |
| --- | --- |
| `'weg-header'` / `'weg-footer'` is not a known element | Add `CUSTOM_ELEMENTS_SCHEMA` on the component template that uses the tag. |
| Header/footer empty | `defineCustomElements()` not called before bootstrap, tag bundle not imported, or `layout` not set — compare with `dummy-data.json`. |
| Auth always shows Sign in | `[signedIn]` not bound or still `false`. |
| SSR: `document is not defined` | Guard `defineCustomElements()` with `typeof window !== 'undefined'` or `isPlatformBrowser`. |

## TypeScript typings

```ts
/// <reference types="weg-shared-layout/dist/types/components" />
```

## Legacy `NgModule`

Add `CUSTOM_ELEMENTS_SCHEMA` on the module that declares components using these tags. `defineCustomElements()` in `main.ts` is still required when using the loader.

## See also

- **[React SPA](./react.md)**
- **[Next.js App Router](./nextjs.md)**
- **[Plain HTML / vanilla JS](./vanilla.md)**
- **[Package readme](../readme.md)**
