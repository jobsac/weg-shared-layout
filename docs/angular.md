# Angular

Short quick start for Angular 16+. For the full **step-by-step** guide (HTTP, API mapping, testing, SSR, troubleshooting), see **[angular-integration-guide.md](./angular-integration-guide.md)**.

Reference demo: [weg-angular-demo](https://github.com/jobsac/weg-angular-demo).

## Integration checklist

- [ ] `npm i weg-shared-layout`
- [ ] `defineCustomElements()` in `main.ts` **before** bootstrap
- [ ] `resolveJsonModule` in `tsconfig.app.json` (if importing JSON)
- [ ] `auth.ts` with `HEADER_SIGN_IN` / `ACCOUNT_LOGIN_HREF` (host app constants)
- [ ] `CUSTOM_ELEMENTS_SCHEMA` on the shell component that uses the tags
- [ ] `[layout]="layoutObject"` on `<weg-header>` and `<weg-footer>`
- [ ] Header: `[signedIn]`, `[userName]`, `(wegAuthClick)` when using auth

## Components

| Tag | Purpose |
| --- | --- |
| `<weg-header>` | Header — CMS nav (signed out), built-in nav (signed in), auth |
| `<weg-footer>` | Footer — social, columns, credits, copyright |

Both accept the same `layout` payload ([`dummy-data.json`](../src/assets/dummy-data.json) or your API). `<weg-header>` also accepts **`signed-in`**, **`user-name`**, and emits **`wegAuthClick`**.

## 1. Install

```bash
npm i weg-shared-layout
```

## 2. Register custom elements (once, before bootstrap)

**Recommended** — loader in `src/main.ts`:

```ts
import { bootstrapApplication } from '@angular/platform-browser';
import { defineCustomElements } from 'weg-shared-layout/loader';

import { appConfig } from './app/app.config';
import { App } from './app/app';

defineCustomElements();

bootstrapApplication(App, appConfig).catch((err) => console.error(err));
```

**Alternative** — side-effect imports (one of these approaches, not both):

```ts
import 'weg-shared-layout/weg-header';
import 'weg-shared-layout/weg-footer';
```

## 3. Allow custom elements in templates

Add `schemas: [CUSTOM_ELEMENTS_SCHEMA]` to every `@Component` (or `@NgModule`) whose template uses `<weg-header>` or `<weg-footer>`. Does **not** cascade to `router-outlet` children.

## 4. Auth constants

```ts
// src/app/auth.ts
export const HEADER_LOGO_HREF = 'https://www.warwickemploymentgroup.com/';

export const HEADER_SIGN_IN = {
  label: 'Sign in',
  href: 'https://account.warwickemploymentgroup.com/account/login',
};

export const ACCOUNT_LOGIN_HREF = HEADER_SIGN_IN.href;
```

## 5. Layout shell — pick one

Use **`[layout]="..."`** so Angular sets the JavaScript `layout` property, not an HTML attribute.

| Variant | Angular | Template bindings |
| --- | --- | --- |
| **5A** Plain properties | 16+ | `[layout]="layoutData"` |
| **5B** Signals | 16.1+ | `[layout]="layoutData()"` |

Full HTTP examples: integration guide **[Step 7A / 7B](./angular-integration-guide.md#step-7--load-layout-from-your-api)**.

### 5A — Plain properties (Angular 16+)

```ts
// src/app/app.ts
import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import layoutFixture from 'weg-shared-layout/dummy-data.json';

import { ACCOUNT_LOGIN_HREF, HEADER_LOGO_HREF, HEADER_SIGN_IN } from './auth';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './app.html',
})
export class App {
  layoutData = {
    ...layoutFixture,
    header: {
      ...layoutFixture.header,
      logoHref: HEADER_LOGO_HREF,
      signIn: HEADER_SIGN_IN,
    },
  };

  signedIn = false;
  userName?: string;

  onAuthClick(event: Event): void {
    const customEvent = event as CustomEvent<{ action: 'sign-in' | 'sign-out' }>;
    customEvent.preventDefault();

    if (customEvent.detail.action === 'sign-out') {
      this.signedIn = false;
      window.location.href = ACCOUNT_LOGIN_HREF;
      return;
    }

    window.location.href =
      this.layoutData.header?.signIn?.href ?? HEADER_SIGN_IN.href;
  }
}
```

```html
<!-- src/app/app.html -->
<weg-header
  [layout]="layoutData"
  [signedIn]="signedIn"
  [userName]="userName"
  (wegAuthClick)="onAuthClick($event)"
></weg-header>

<router-outlet />

<weg-footer [layout]="layoutData"></weg-footer>
```

Enable `resolveJsonModule` in `tsconfig.app.json` if you import `dummy-data.json`.

In production, load the same shape from your API — see **[Step 7A](./angular-integration-guide.md#step-7a--http-with-rxjs--async-pipe-pairs-with-6a)**. If your API returns separate arrays, see **[mapping section](./angular-integration-guide.md#optional-api-returns-separate-arrays-not-one-layout-object)**.

### 5B — Signals (Angular 16.1+)

```ts
// src/app/app.ts
import { Component, CUSTOM_ELEMENTS_SCHEMA, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import layoutFixture from 'weg-shared-layout/dummy-data.json';

import { ACCOUNT_LOGIN_HREF, HEADER_LOGO_HREF, HEADER_SIGN_IN } from './auth';
import type { LayoutData } from './layout.types';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './app.html',
})
export class App {
  readonly layoutData = signal<LayoutData>({
    ...layoutFixture,
    header: {
      ...layoutFixture.header,
      logoHref: HEADER_LOGO_HREF,
      signIn: HEADER_SIGN_IN,
    },
  });

  readonly signedIn = signal(false);
  readonly userName = signal<string | undefined>(undefined);

  onAuthClick(event: Event): void {
    const customEvent = event as CustomEvent<{ action: 'sign-in' | 'sign-out' }>;
    customEvent.preventDefault();

    if (customEvent.detail.action === 'sign-out') {
      this.signedIn.set(false);
      this.userName.set(undefined);
      window.location.href = ACCOUNT_LOGIN_HREF;
      return;
    }

    window.location.href =
      this.layoutData().header?.signIn?.href ?? HEADER_SIGN_IN.href;
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

HTTP with signals: **[Step 7B](./angular-integration-guide.md#step-7b--http-with-signals--tosignal-pairs-with-6b)** (`toSignal` + same `LayoutService`).

## Header: `signed-in`, `user-name`, `wegAuthClick`

| Input / output | Binding (5A) | Binding (5B) | Notes |
| --- | --- | --- | --- |
| CMS nav | `[layout]="layoutData"` | `[layout]="layoutData()"` | `dropdowns`, `links`, `signIn` when signed out |
| Session state | `[signedIn]="signedIn"` | `[signedIn]="signedIn()"` | `true` → built-in signed-in nav |
| User name | `[userName]="userName"` | `[userName]="userName()"` | Manage Account label when signed in |
| Auth click | `(wegAuthClick)="onAuthClick($event)"` | `detail.action`: `'sign-in'` \| `'sign-out'` |
| Prevent default | `preventDefault()` in handler | Stops component default navigation |

**Signed-in nav (built in):** Find a job, Dashboard, Manage Account, Sign out.

Logo **image** is bundled. Logo **link** uses `layout.header.logoHref` when signed out.

## Footer

`<weg-footer>` only needs `[layout]`. See [`dummy-data.json`](../src/assets/dummy-data.json) for `footer` shape.

## Troubleshooting

| Symptom | Cause / fix |
| --- | --- |
| `'weg-header'` / `'weg-footer'` is not a known element | `CUSTOM_ELEMENTS_SCHEMA` on the template's component |
| Header/footer empty | `defineCustomElements()` before bootstrap, or missing `[layout]` |
| Nav empty after passing an array | `[layout]` must be `{ header, footer }`, not a bare array |
| Auth always Sign in | `[signedIn]` not bound or still `false` |
| Manage Account generic | `[userName]` not set when signed in |
| SSR: `document is not defined` | Guard `defineCustomElements()` with `typeof window !== 'undefined'` |

More detail: **[integration guide § Troubleshooting](./angular-integration-guide.md#troubleshooting)**.

## See also

- **[Angular integration guide (step-by-step)](./angular-integration-guide.md)**
- **[React SPA](./react.md)**
- **[Next.js App Router](./nextjs.md)**
- **[Plain HTML / vanilla JS](./vanilla.md)**
- **[Package readme](../readme.md)**
