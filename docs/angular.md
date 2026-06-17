# Angular 16 integration

Step-by-step guide for **Angular 16** (standalone or NgModule). Uses plain component properties — no signals.

Runnable reference: **[demo/angular16](../demo/angular16/README.md)** (`npm run demo:angular16` from repo root).

Newer Angular (signals): [weg-angular-demo](https://github.com/jobsac/weg-angular-demo) — same layout ideas, different syntax.

---

## Checklist

Copy this while integrating:

- [ ] **Step 1** — `npm i weg-shared-layout`
- [ ] **Step 2** — `tsconfig`: `skipLibCheck`, `resolveJsonModule`, `moduleResolution`
- [ ] **Step 3** — `defineCustomElements()` in `main.ts` **before** bootstrap
- [ ] **Step 4** — `layout.types.ts` from package fixture
- [ ] **Step 5** — `auth.ts` with sign-out URL (optional; only if handling `wegAuthClick`)
- [ ] **Step 6** — `CUSTOM_ELEMENTS_SCHEMA` on the shell component
- [ ] **Step 7** — Template with **`[layout]`** property binding
- [ ] **Step 8** — Header: `[signedIn]`, `[userName]`, `[accountBaseUrl]` (optional), `(wegAuthClick)`
- [ ] **Step 9** — Verify in DevTools: `$0.layout` is an object on `<weg-header>`

---

## Step 1 — Install

```bash
npm i weg-shared-layout
```

---

## Step 2 — TypeScript config

In **`tsconfig.json`** and/or **`tsconfig.app.json`**:

```json
{
  "compilerOptions": {
    "skipLibCheck": true,
    "resolveJsonModule": true,
    "moduleResolution": "bundler"
  },
  "include": ["src/**/*.ts"]
}
```

| Option | Why |
| --- | --- |
| `skipLibCheck` | Skips Stencil `stencil-public-runtime.d.ts` (TS 5 syntax) when on TS 4.9 |
| `resolveJsonModule` | Allows `import … from 'weg-shared-layout/dummy-data.json'` |
| `moduleResolution: "bundler"` | Resolves package `exports` (`loader`, `dummy-data.json`) |

Use **`node16`** instead of **`bundler`** if you must stay on TypeScript 4.9. Classic **`node`** does not resolve subpaths reliably.

---

## Step 3 — Register custom elements

Call the Stencil loader in **`src/main.ts`** once, **before** bootstrap:

```ts
import { bootstrapApplication } from '@angular/platform-browser';
import { defineCustomElements } from 'weg-shared-layout/loader';

import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';

defineCustomElements();

bootstrapApplication(AppComponent, appConfig).catch((err) => console.error(err));
```

If header/footer tags appear but nav is empty, registration did not run or ran too late.

**NgModule apps:** same `defineCustomElements()` call, then `platformBrowserDynamic().bootstrapModule(AppModule)`.

---

## Step 4 — Layout types

```ts
// src/app/layout.types.ts
import layoutFixture from 'weg-shared-layout/dummy-data.json';

export type LayoutData = typeof layoutFixture;
```

Alternative (types only, no JSON import):

```ts
import type { LayoutData } from 'weg-shared-layout/layout-data';
```

---

## Step 5 — Sign-out handling

Sign-in is a normal nav link in your CMS layout. Handle sign-out via **`wegAuthClick`** — call your logout API, then redirect (e.g. to `/`).

---

## Step 6 — Shell component

Add `CUSTOM_ELEMENTS_SCHEMA` to the component whose template contains `<weg-header>` / `<weg-footer>`. It does **not** cascade to routed children.

```ts
// src/app/app.component.ts
import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import layoutFixture from 'weg-shared-layout/dummy-data.json';

import type { LayoutData } from './layout.types';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './app.component.html',
})
export class AppComponent {
  layoutData: LayoutData = layoutFixture;

  signedIn = false;
  userName?: string;

  onAuthClick(event: Event): void {
    const customEvent = event as CustomEvent<{ action: 'sign-in' | 'sign-out' }>;
    if (customEvent.detail.action !== 'sign-out') return;

    customEvent.preventDefault();
    this.signedIn = false;
    void this.logout().then(() => {
      window.location.assign('/');
    });
  }

  private async logout(): Promise<void> {
    // Call your account API logout endpoint
  }
}
```

---

## Step 7 — Template

Use **`[layout]="..."`** so Angular sets the JavaScript property, not an HTML attribute.

```html
<!-- src/app/app.component.html -->
<weg-header
  [layout]="layoutData"
  [signedIn]="signedIn"
  [userName]="userName"
  (wegAuthClick)="onAuthClick($event)"
></weg-header>

<main>
  <router-outlet></router-outlet>
</main>

<weg-footer [layout]="layoutData"></weg-footer>
```

| Binding | Purpose |
| --- | --- |
| `[layout]` | CMS nav when signed out; same object for header and footer |
| `[signedIn]` | `true` → built-in signed-in nav (ignores CMS `header.menu`) |
| `[userName]` | First name on Manage Account when signed in |
| `[accountBaseUrl]` | Account portal origin for signed-in links (optional; production default when omitted) |
| `(wegAuthClick)` | Required for sign-out — call logout API and redirect; sign-in follows the link `href` |

Run the app — you should see header nav and footer.

---

## Step 8 — Load layout from your API (optional)

When ready, replace the static fixture with HTTP. Register `provideHttpClient()` in `app.config.ts`.

**`src/app/layout.service.ts`:**

```ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';

import type { LayoutData } from './layout.types';

const DEFAULT_SIGN_IN = {
  label: 'Sign in',
  href: 'https://account.warwickemploymentgroup.com/account/login',
};

@Injectable({ providedIn: 'root' })
export class LayoutService {
  constructor(private http: HttpClient) {}

  loadLayout(): Observable<LayoutData> {
    return this.http.get<LayoutData>('/api/layout').pipe(
      map((data) => this.ensureSignInMenu(data)),
    );
  }

  private ensureSignInMenu(data: LayoutData): LayoutData {
    const menu = data.header?.menu ?? [];
    const hasSignIn = menu.some(
      (item) =>
        !item.items?.length &&
        item.label?.trim().toLowerCase() === 'sign in',
    );
    if (hasSignIn) return data;
    return {
      ...data,
      header: { ...data.header, menu: [...menu, DEFAULT_SIGN_IN] },
    };
  }
}
```

**`src/app/app.component.ts`** (HTTP variant):

```ts
import { AsyncPipe } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Observable } from 'rxjs';

import type { LayoutData } from './layout.types';
import { LayoutService } from './layout.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [AsyncPipe, RouterOutlet],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './app.component.html',
})
export class AppComponent {
  layout$: Observable<LayoutData>;
  signedIn = false;
  userName?: string;

  constructor(layoutService: LayoutService) {
    this.layout$ = layoutService.loadLayout();
  }

  onAuthClick(event: Event): void {
    const customEvent = event as CustomEvent<{ action: 'sign-in' | 'sign-out' }>;
    if (customEvent.detail.action !== 'sign-out') return;

    customEvent.preventDefault();
    this.signedIn = false;
    void this.logout().then(() => {
      window.location.assign('/');
    });
  }

  private async logout(): Promise<void> {
    // Call your account API logout endpoint
  }
}
```

**`src/app/app.component.html`** (Angular 16 — use `*ngIf`, not `@if`):

```html
<ng-container *ngIf="layout$ | async as layout">
  <weg-header
    [layout]="layout"
    [signedIn]="signedIn"
    [userName]="userName"
    (wegAuthClick)="onAuthClick($event)"
  ></weg-header>

  <main>
    <router-outlet></router-outlet>
  </main>

  <weg-footer [layout]="layout"></weg-footer>
</ng-container>
```

Add `CommonModule` or `NgIf` + `AsyncPipe` to `imports` if not already present.

---

## Step 9 — Verify

1. Open DevTools → Elements → select `<weg-header>`.
2. In the console:

```js
$0.layout      // must be a plain object, not undefined
$0.signedIn    // boolean
$0.userName    // string or undefined
```

If `layout` looks like `"[object Object]"`, you used attribute binding instead of `[layout]`.

---

## Layout shape

Both tags accept one **`layout`** object with `header` and `footer` keys — **not** a bare array at the top level.

Full reference: [`dummy-data.json`](../src/assets/dummy-data.json) or [`GET /api/layout`](https://weg-payload-test.vercel.app/api/layout).

```json
{
  "header": {
    "menu": [
      { "label": "Find a job", "items": [{ "label": "Graduates", "href": "…" }] },
      { "label": "Career advice", "href": "…" },
      { "label": "Sign in", "href": "…" }
    ]
  },
  "footer": {
    "menu": [[{ "label": "About WEG", "href": "…" }]],
    "social": [{ "platform": "LinkedIn", "href": "…" }],
    "credits": "…",
    "copyright": "…"
  }
}
```

### API returns separate arrays?

If your API does not return one `{ header, footer }` object, merge in a service:

```ts
forkJoin({
  menuGroups: this.http.get<LayoutData['header']>('/api/nav/menu'),
  flatLinks: this.http.get<LayoutData['header']>('/api/nav/links'),
  footer: this.http.get<LayoutData['footer']>('/api/footer'),
}).pipe(
  map(({ menuGroups, flatLinks, footer }) => ({
    header: { menu: [...menuGroups, ...flatLinks, DEFAULT_SIGN_IN] },
    footer,
  })),
);
```

---

## Troubleshooting

| Symptom | Fix |
| --- | --- |
| `'weg-header'` is not a known element | `CUSTOM_ELEMENTS_SCHEMA` on the component that owns the template |
| Header/footer empty | `defineCustomElements()` before bootstrap |
| Nav empty after passing data | `[layout]` must be `{ header, footer }`, not a bare array |
| Auth always Sign in | Bind `[signedIn]` from session state |
| Generic Manage Account | Pass `[userName]` when signed in |
| Staging account portal | Pass `[accountBaseUrl]` (e.g. `https://account-staging.example.com`) |
| `Mixin<const …>` / TS1139 in `stencil-public-runtime.d.ts` | Add `skipLibCheck: true` and/or upgrade to TypeScript 5.0+ |
| Cannot resolve `weg-shared-layout/loader` | Set `moduleResolution` to `bundler` or `node16` |
| SSR: `document is not defined` | Guard: `if (typeof window !== 'undefined') defineCustomElements()` |

### TypeScript 4.9 + Stencil errors

Stencil ships `.d.ts` files with TypeScript 5 syntax. On Angular 16 with TS 4.9:

1. Add **`skipLibCheck: true`** (recommended), or
2. Upgrade to **TypeScript 5.0–5.1** (supported by Angular 16.1+): `npm i -D typescript@~5.1.6`

For typing only, avoid pulling Stencil runtime declarations:

```ts
import type { LayoutData } from 'weg-shared-layout/layout-data';
// or
export type LayoutData = typeof layoutFixture; // from dummy-data.json
```

---

## File map

| File | Role |
| --- | --- |
| `src/main.ts` | `defineCustomElements()` then bootstrap |
| `tsconfig.json` | `skipLibCheck`, `resolveJsonModule`, `moduleResolution` |
| `src/app/layout.types.ts` | `export type LayoutData = typeof layoutFixture` |
| `src/app/auth.ts` | `POST_LOGOUT_HREF` (optional) |
| `src/app/layout.service.ts` | HTTP / API mapping (optional) |
| `src/app/app.component.ts` | Shell: schema, layout, auth handler |
| `src/app/app.component.html` | `<weg-header>`, `<router-outlet>`, `<weg-footer>` |

---

## See also

- [Documentation index](./README.md)
- [In-repo Angular 16 demo](../demo/angular16/README.md)
- [Package readme](../readme.md)
- [React SPA](./react.md) · [Next.js](./nextjs.md) · [Vanilla JS](./vanilla.md)
