# Angular

Quick start for Angular apps. For the full guide — **Angular 16+ without signals**, layout/array mapping, RxJS patterns, testing, and troubleshooting — see **[angular-integration-guide.md](./angular-integration-guide.md)**.

Reference demo: [weg-angular-demo](https://github.com/jobsac/weg-angular-demo).

## Components

| Tag | Import (optional, no loader) |
| --- | --- |
| `<weg-header>` | `import 'weg-shared-layout/weg-header';` |
| `<weg-footer>` | `import 'weg-shared-layout/weg-footer';` |

Both accept the same `layout` payload ([`dummy-data.json`](../src/assets/dummy-data.json)). `<weg-header>` also accepts **`signed-in`**, **`user-name`**, and emits **`wegAuthClick`**.

> **Signals are optional.** Examples below use signals for brevity; plain properties and RxJS work the same — see the [integration guide](./angular-integration-guide.md#3-signals-are-not-required).

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

**Alternative:** side-effect import only the tags you need (no loader call):

```ts
import 'weg-shared-layout/weg-header';
import 'weg-shared-layout/weg-footer';
```

## 3. Allow custom elements in templates

Add `schemas: [CUSTOM_ELEMENTS_SCHEMA]` to every `@Component` (or `@NgModule`) whose template uses `<weg-header>` or `<weg-footer>` (does not cascade through `router-outlet` children).

## 4. Layout shell example

Use **`[layout]="..."`** so Angular sets the JavaScript `layout` property, not an HTML attribute.

```ts
// src/app/app.ts
import { Component, CUSTOM_ELEMENTS_SCHEMA, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ACCOUNT_LOGIN_HREF, HEADER_SIGN_IN } from '../auth';
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
  protected readonly userName = signal<string | undefined>(undefined);

  protected onAuthClick(event: Event) {
    const customEvent = event as CustomEvent<{ action: 'sign-in' | 'sign-out' }>;
    customEvent.preventDefault();

    if (customEvent.detail.action === 'sign-out') {
      this.signedIn.set(false);
      window.location.href = ACCOUNT_LOGIN_HREF;
      return;
    }

    window.location.href = layoutFixture.header.signIn?.href ?? HEADER_SIGN_IN.href;
  }
}
```

```html
<!-- src/app/app.html -->
<weg-header
  [layout]="layoutData()"
  [signedIn]="signedIn()"
  [userName]="userName()"
  (wegAuthClick)="onAuthClick($event)"
></weg-header>

<router-outlet />

<weg-footer [layout]="layoutData()"></weg-footer>
```

Enable `resolveJsonModule` in `tsconfig.app.json` if you import `dummy-data.json`.

Define auth URLs in `src/app/auth.ts` (same shape as the React/Next examples).

In production, replace `layoutFixture` with data from your services; keep the same object shape. If your API returns separate arrays, map them into `{ header: { ... }, footer: { ... } }` — see [Passing arrays and mapping API data](./angular-integration-guide.md#7-passing-arrays-and-mapping-api-data).

## Header: `signed-in`, `user-name`, and `wegAuthClick`

| Input / output | Binding | Notes |
| --- | --- | --- |
| CMS nav | `[layout]="layoutData()"` | `dropdowns`, `links`, `signIn` used when signed out |
| Session state | `[signedIn]="signedIn()"` | When `true`, CMS nav is ignored; built-in signed-in nav is shown |
| User name | `[userName]="userName()"` | First name on Manage Account (signed in only) |
| Auth click | `(wegAuthClick)="onAuthClick($event)"` | `event.detail.action` is `'sign-in'` or `'sign-out'` |
| Prevent default | `event.preventDefault()` in handler | Stops link navigation / redirect |

**Signed-in nav (built into the component):** Find a job, Dashboard, Manage Account, Sign out.

Logo **image** is bundled. Logo **link** uses `layout.header.logoHref` when signed out (defaults to WEG home).

## Footer

`<weg-footer>` only needs `[layout]`. See [`dummy-data.json`](../src/assets/dummy-data.json) for the `footer` shape (social, columns, credits, copyright).

## Troubleshooting

| Symptom | Cause / fix |
| --- | --- |
| `'weg-header'` / `'weg-footer'` is not a known element | Add `CUSTOM_ELEMENTS_SCHEMA` on the component template that uses the tag. |
| Header/footer empty | `defineCustomElements()` not called before bootstrap, tag bundle not imported, or `layout` not set. |
| Nav empty after passing an array | `[layout]` must be an object; put arrays in `header.dropdowns`, `header.links`, etc. |
| Auth always shows Sign in | `[signedIn]` not bound or still `false`. |
| Manage Account shows generic label | `[userName]` not set when signed in. |
| SSR: `document is not defined` | Guard `defineCustomElements()` with `typeof window !== 'undefined'` or `isPlatformBrowser`. |

More detail: **[angular-integration-guide.md § Troubleshooting](./angular-integration-guide.md#15-troubleshooting)**.

## See also

- **[Angular integration guide (full)](./angular-integration-guide.md)**
- **[React SPA](./react.md)**
- **[Next.js App Router](./nextjs.md)**
- **[Plain HTML / vanilla JS](./vanilla.md)**
- **[Package readme](../readme.md)**
