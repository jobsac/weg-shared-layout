# Angular integration guide

Step-by-step guide for **Angular 16+** (standalone or NgModule). Covers static fixtures, HTTP layout, auth, and common pitfalls.

| Doc | When to use it |
| --- | --- |
| **This guide** | First integration, production setup, API mapping, testing, SSR |
| **[angular.md](./angular.md)** | Short copy-paste quick start (same steps, fewer words) |
| **[weg-angular-demo](https://github.com/jobsac/weg-angular-demo)** | Runnable reference app |

---

## How to read this guide

1. Follow **[Step-by-step integration](#step-by-step-integration)** in order — that is the complete happy path.
2. Skim **[Layout data reference](#layout-data-reference)** when shaping CMS/API JSON.
3. Use **[Optional sections](#optional-sections)** only when they match your app (separate API arrays, signals, SSR, tests, etc.).
4. If something breaks, go to **[Troubleshooting](#troubleshooting)**.

**Steps 6 and 7 include two variants each** — pick the one that matches your app:

| Variant | Angular | State style |
| --- | --- | --- |
| **6A / 7A** | 16+ | Plain fields + RxJS `async` pipe (HTTP) |
| **6B / 7B** | 16.1+ (signals) | `signal()` + `toSignal()` for HTTP |

The web components are identical; only Angular template syntax differs (`layoutData` vs `layoutData()`).

---

## Integration checklist

Copy this list while integrating:

- [ ] **Step 1** — `npm i weg-shared-layout`
- [ ] **Step 2** — `defineCustomElements()` in `main.ts` **before** bootstrap
- [ ] **Step 3** — `resolveJsonModule` in `tsconfig.app.json` (if importing JSON)
- [ ] **Step 4** — `src/app/auth.ts` with sign-in URL constants (host app, not from package)
- [ ] **Step 5** — `CUSTOM_ELEMENTS_SCHEMA` on the shell `@Component` (or `@NgModule`) that owns `<weg-header>` / `<weg-footer>`
- [ ] **Step 6** — Shell template with **`[layout]`** property binding (not `layout="..."`)
- [ ] **Step 7** — Replace fixture with HTTP/CMS when ready; keep `{ header, footer }` object shape
- [ ] **Step 8** — Header: `[signedIn]`, `[userName]`, `(wegAuthClick)` + `preventDefault()` if you handle auth
- [ ] **Step 9** — Confirm in DevTools: `$0.layout` is an object on `<weg-header>`

---

## What you are integrating

`weg-shared-layout` ships two **Stencil Web Components**:

| Tag | Purpose |
| --- | --- |
| `<weg-header>` | Header — bundled logo, CMS nav (signed out), built-in nav (signed in), Sign in / Manage Account / Sign out |
| `<weg-footer>` | Footer — social links, columns, credits, copyright |

They are **presentational**: they **do not** fetch data. Your Angular app loads layout JSON and passes it in.

Angular treats them as **custom elements**. Bind JavaScript **properties** (square brackets in templates):

```js
header.layout = { header: { ... }, footer: { ... } };
header.signedIn = true;
header.userName = 'Alex';
```

The components do not depend on signals, RxJS, or standalone vs NgModule — only that values reach the element properties.

### Requirements

| Requirement | Notes |
| --- | --- |
| **Angular 16+** | Standalone and NgModule both work |
| **Property binding** | `[layout]="obj"` — not `layout="{{ obj }}"` |
| **`CUSTOM_ELEMENTS_SCHEMA`** | On every component template that uses the tags; **does not** cascade to routed children |
| **One-time registration** | `defineCustomElements()` once per browser load (recommended) |

---

## Step-by-step integration

These steps assume a **standalone** Angular app with `src/app/app.ts` + `src/app/app.html`. For **NgModule** bootstrap, see [Optional: NgModule bootstrap](#optional-ngmodule-bootstrap).

### Step 1 — Install the package

```bash
npm i weg-shared-layout
# or
pnpm add weg-shared-layout
```

---

### Step 2 — Register custom elements (once, before bootstrap)

**Recommended:** call the Stencil loader in `src/main.ts` **before** `bootstrapApplication`:

```ts
// src/main.ts
import { bootstrapApplication } from '@angular/platform-browser';
import { defineCustomElements } from 'weg-shared-layout/loader';

import { appConfig } from './app/app.config';
import { App } from './app/app';

defineCustomElements();

bootstrapApplication(App, appConfig).catch((err) => console.error(err));
```

**Alternative:** side-effect import only the tags you use (also once, before bootstrap). Pick one approach, not both:

```ts
import 'weg-shared-layout/weg-header';
import 'weg-shared-layout/weg-footer';
```

If header/footer are empty but tags appear in the DOM, registration did not run or ran too late.

---

### Step 3 — TypeScript: import layout JSON

In `tsconfig.app.json` (or `tsconfig.json`):

```json
{
  "compilerOptions": {
    "resolveJsonModule": true
  }
}
```

Create a shared layout type in `src/app/layout.types.ts`:

```ts
// src/app/layout.types.ts
import layoutFixture from 'weg-shared-layout/dummy-data.json';

/** Aligns with weg-shared-layout / CMS GET /api/layout shape */
export type LayoutData = typeof layoutFixture;
```

During development you can import the package fixture:

```ts
import layoutFixture from 'weg-shared-layout/dummy-data.json';
```

Production: same shape from your API (e.g. [`GET /api/layout`](https://weg-payload-test.vercel.app/api/layout)).

---

### Step 4 — Auth URLs in your app (not from the package)

Create `src/app/auth.ts`. Host apps own sign-in/out URLs — do not import auth constants from `weg-shared-layout`.

```ts
// src/app/auth.ts
export const HEADER_LOGO_HREF = 'https://www.warwickemploymentgroup.com/';

export const HEADER_SIGN_IN = {
  label: 'Sign in',
  href: 'https://account.warwickemploymentgroup.com/account/login',
};

/** Where to send the user after sign-out (often same as login) */
export const ACCOUNT_LOGIN_HREF = HEADER_SIGN_IN.href;
```

You will merge `HEADER_LOGO_HREF` and `HEADER_SIGN_IN` into layout data in Step 6/7.

---

### Step 5 — Allow custom elements in templates

Angular's compiler does not recognize `<weg-header>` / `<weg-footer>` unless you opt in.

Add `schemas: [CUSTOM_ELEMENTS_SCHEMA]` to the **shell** component whose template contains the tags (usually `App`):

```ts
// src/app/app.ts
import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './app.html',
})
export class App {
  // layout + auth — Step 6
}
```

**Important:** If only `App` has the header/footer, only `App` needs the schema. Routed child components do **not** inherit it from a parent.

---

### Step 6 — Shell component with layout (static fixture)

Complete minimal shell (no HTTP yet). Use **6A** or **6B** — not both.

#### Step 6A — Plain properties (Angular 16+)

**`src/app/app.ts`:**

```ts
import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
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
  /** Same object for header and footer */
  layoutData: LayoutData = {
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

**`src/app/app.html`:**

```html
<weg-header
  [layout]="layoutData"
  [signedIn]="signedIn"
  [userName]="userName"
  (wegAuthClick)="onAuthClick($event)"
></weg-header>

<main>
  <router-outlet />
</main>

<weg-footer [layout]="layoutData"></weg-footer>
```

Binding rules (6A):

| Correct | Wrong |
| --- | --- |
| `[layout]="layoutData"` | `layout="{{ layoutData }}"` (string attribute) |
| `[signedIn]="signedIn"` | Omitting `signedIn` when you need signed-in nav |
| No `()` on bindings | `layoutData()` — that is for **6B** only |

---

#### Step 6B — Signals (Angular 16.1+)

Same shell as 6A; bindings use `()` because values are signals.

**`src/app/app.ts`:**

```ts
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

**`src/app/app.html`:**

```html
<weg-header
  [layout]="layoutData()"
  [signedIn]="signedIn()"
  [userName]="userName()"
  (wegAuthClick)="onAuthClick($event)"
></weg-header>

<main>
  <router-outlet />
</main>

<weg-footer [layout]="layoutData()"></weg-footer>
```

Run the app — you should see header nav and footer. Continue to **Step 7A** or **7B** for HTTP.

---

### Step 7 — Load layout from your API

Use **7A** (RxJS `async` pipe) or **7B** (`toSignal`) — same `LayoutService` as below. Pick the pair that matches Step 6 (6A → 7A, 6B → 7B).

**`src/app/layout.service.ts`** (shared by 7A and 7B):

```ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';

import { HEADER_LOGO_HREF, HEADER_SIGN_IN } from './auth';
import type { LayoutData } from './layout.types';

@Injectable({ providedIn: 'root' })
export class LayoutService {
  constructor(private http: HttpClient) {}

  /** CMS returns full { header, footer } object */
  loadLayout(): Observable<LayoutData> {
    return this.http.get<LayoutData>('/api/layout').pipe(
      map((data) => this.withAppHeaderOverrides(data)),
    );
  }

  private withAppHeaderOverrides(data: LayoutData): LayoutData {
    return {
      ...data,
      header: {
        ...data.header,
        logoHref: HEADER_LOGO_HREF,
        signIn: HEADER_SIGN_IN,
      },
    };
  }
}
```

Register `provideHttpClient()` in `app.config.ts` if not already present.

#### Step 7A — HTTP with RxJS + `async` pipe (pairs with 6A)

**`src/app/app.ts`:**

```ts
import { AsyncPipe } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Observable } from 'rxjs';

import { ACCOUNT_LOGIN_HREF, HEADER_SIGN_IN } from './auth';
import type { LayoutData } from './layout.types';
import { LayoutService } from './layout.service';

@Component({
  selector: 'app-root',
  imports: [AsyncPipe, RouterOutlet],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './app.html',
})
export class App {
  layout$: Observable<LayoutData>;
  signedIn = false;
  userName?: string;

  constructor(layoutService: LayoutService) {
    this.layout$ = layoutService.loadLayout();
  }

  onAuthClick(event: Event): void {
    const customEvent = event as CustomEvent<{ action: 'sign-in' | 'sign-out' }>;
    customEvent.preventDefault();

    if (customEvent.detail.action === 'sign-out') {
      this.signedIn = false;
      window.location.href = ACCOUNT_LOGIN_HREF;
      return;
    }

    window.location.href = HEADER_SIGN_IN.href;
  }
}
```

**`src/app/app.html`:**

```html
@if (layout$ | async; as layout) {
  <weg-header
    [layout]="layout"
    [signedIn]="signedIn"
    [userName]="userName"
    (wegAuthClick)="onAuthClick($event)"
  ></weg-header>

  <main>
    <router-outlet />
  </main>

  <weg-footer [layout]="layout"></weg-footer>
}
```

`@if (layout$ | async; as layout)` avoids a flash of empty header while the request is in flight. On older Angular without `@if`, use `*ngIf="layout$ | async as layout"`.

Use `shareReplay(1)` on `layout$` if multiple subscribers need the same payload.

---

#### Step 7B — HTTP with signals + `toSignal` (pairs with 6B)

Requires **Angular 16.1+** (`@angular/core/rxjs-interop`).

**`src/app/app.ts`:**

```ts
import { Component, CUSTOM_ELEMENTS_SCHEMA, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterOutlet } from '@angular/router';

import { ACCOUNT_LOGIN_HREF, HEADER_SIGN_IN } from './auth';
import { LayoutService } from './layout.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './app.html',
})
export class App {
  private readonly layoutService = inject(LayoutService);

  readonly layout = toSignal(this.layoutService.loadLayout());
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

    window.location.href = HEADER_SIGN_IN.href;
  }
}
```

**`src/app/app.html`:**

```html
@if (layout(); as layout) {
  <weg-header
    [layout]="layout"
    [signedIn]="signedIn()"
    [userName]="userName()"
    (wegAuthClick)="onAuthClick($event)"
  ></weg-header>

  <main>
    <router-outlet />
  </main>

  <weg-footer [layout]="layout"></weg-footer>
}
```

`toSignal` bridges the HTTP `Observable` from `LayoutService` into a signal for the template. Session fields (`signedIn`, `userName`) stay as signals, same as Step 6B.

---

### Step 8 — Header auth behaviour

| Binding | Web component | Purpose |
| --- | --- | --- |
| `[layout]="..."` | `layout` | CMS nav when **signed out** |
| `[signedIn]="..."` | `signed-in` | `true` → built-in signed-in nav (ignores CMS dropdowns/links/signIn) |
| `[userName]="..."` | `user-name` | First name on Manage Account when signed in |
| `(wegAuthClick)="..."` | `wegAuthClick` | `detail.action`: `'sign-in'` \| `'sign-out'` |

**Signed out** (`signedIn === false`):

- Uses `layout.header.dropdowns`, `links`, `signIn`
- Logo links to `layout.header.logoHref` (default WEG home if omitted); logo **image** is bundled

**Signed in** (`signedIn === true`):

- Built-in links: Find a job, Dashboard, Manage Account, Sign out
- `userName` customizes Manage Account label

Call `event.preventDefault()` in `onAuthClick` when **your** app handles navigation. Without `preventDefault()`, the component uses default redirects.

Wire `signedIn` / `userName` from your session service (set `signedIn = true` and `userName` when the user logs in).

---

### Step 9 — Verify in the browser

1. Open DevTools → Elements → select `<weg-header>`.
2. In the console:

```js
$0.layout      // must be a plain object, not undefined
$0.signedIn    // boolean
$0.userName    // string or undefined
```

3. If `layout` is missing or looks like `"[object Object]"`, you used attribute binding instead of `[layout]`.
4. Footer: same `layout` object; only `layout.footer` is read.

---

## Layout data reference

Both tags accept one **`layout`** object with optional `header` and `footer` keys — **not** a bare array at the top level.

### TypeScript shape

```ts
type LayoutLink = { label: string; href: string };

type LayoutHeaderDropdown = {
  label: string;
  items: LayoutLink[];
};

type LayoutHeaderData = {
  logoHref?: string;
  dropdowns?: LayoutHeaderDropdown[];
  links?: LayoutLink[];
  signIn?: LayoutLink;
  signOut?: { label: string; href?: string };
};

type LayoutFooterSocialLink = {
  platform: 'LinkedIn' | 'Instagram' | 'TikTok' | 'YouTube';
  href: string;
};

type LayoutFooterColumn = {
  links: LayoutLink[];
};

type LayoutData = {
  header?: Partial<LayoutHeaderData>;
  footer?: Partial<{
    social: LayoutFooterSocialLink[];
    columns: LayoutFooterColumn[];
    credits: string;
    copyright: string;
  }>;
};
```

Full example JSON:

- **From npm:** `import layout from 'weg-shared-layout/dummy-data.json'`
- **In this repo:** [`src/assets/dummy-data.json`](../src/assets/dummy-data.json)
- **Live CMS sample:** [`GET /api/layout`](https://weg-payload-test.vercel.app/api/layout)

### Abbreviated JSON

```json
{
  "header": {
    "logoHref": "https://www.warwickemploymentgroup.com/",
    "dropdowns": [
      {
        "label": "Find a job",
        "items": [
          { "label": "Graduates", "href": "https://example.com/jobs/graduates" }
        ]
      }
    ],
    "links": [
      { "label": "Career advice", "href": "https://example.com/career-advice" },
      { "label": "Register", "href": "https://example.com/register" }
    ],
    "signIn": { "label": "Sign in", "href": "https://example.com/login" }
  },
  "footer": {
    "social": [
      { "platform": "LinkedIn", "href": "https://linkedin.com/company/example" }
    ],
    "columns": [
      { "links": [{ "label": "About WEG", "href": "/about" }] }
    ],
    "credits": "Warwick Employment Group …",
    "copyright": "Copyright © Warwick Employment Group."
  }
}
```

### Which fields are used when

| Field | Used when | Notes |
| --- | --- | --- |
| `header.logoHref` | Signed **out** | Logo link; image is bundled |
| `header.dropdowns` | Signed **out** | `{ label, items[] }` |
| `header.links` | Signed **out** | Flat nav links |
| `header.signIn` | Signed **out** | Sign in button |
| `header.signOut` | Rarely | Signed-in sign-out uses built-in URLs |
| `footer.social` | Always | `platform` must be `LinkedIn`, `Instagram`, `TikTok`, or `YouTube` exactly |
| `footer.columns` | Always | `{ links: [...] }[]` |
| `footer.credits` | Always | Text below columns |
| `footer.copyright` | Always | Copyright line |

When **`signedIn` is true**, `<weg-header>` **ignores** `dropdowns`, `links`, and `signIn` from layout.

### Property binding vs attributes

```html
<!-- Correct -->
<weg-header [layout]="layoutData"></weg-header>

<!-- Wrong for objects -->
<weg-header layout="{{ layoutData }}"></weg-header>
```

The component can parse a JSON **string** for `layout`, but `[layout]="object"` is the Angular norm.

### Invalid entries are silently dropped

- Links without `label` or `href` are skipped
- Dropdowns with empty `items` are skipped
- Unknown social `platform` values are skipped
- Malformed input → empty sections (no throw) — inspect `$0.layout` in DevTools

---

## Optional sections

Read only what applies to your app.

### Optional: API returns separate arrays (not one layout object)

**Skip this section** if your API already returns `{ header: { ... }, footer: { ... } }`.

The top-level `[layout]` binding must be an **object**, not an array:

```ts
// ❌ Will NOT work — nav stays empty
const navLinks = [
  { label: 'Career advice', href: '/career-advice' },
];
// template: [layout]="navLinks"
```

**✅** Put arrays **inside** the layout object:

| Field | Array element shape |
| --- | --- |
| `header.dropdowns` | `{ label, items: { label, href }[] }` |
| `header.links` | `{ label, href }` |
| `footer.social` | `{ platform, href }` |
| `footer.columns` | `{ links: { label, href }[] }` |

**`src/app/layout.service.ts` — merge multiple endpoints:**

```ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { forkJoin, map, Observable } from 'rxjs';

import { HEADER_LOGO_HREF, HEADER_SIGN_IN } from './auth';
import type { LayoutData } from './layout.types';

@Injectable({ providedIn: 'root' })
export class LayoutService {
  constructor(private http: HttpClient) {}

  loadLayoutFromParts(): Observable<LayoutData> {
    return forkJoin({
      dropdowns: this.http.get<NonNullable<LayoutData['header']>['dropdowns']>(
        '/api/nav/dropdowns',
      ),
      links: this.http.get<NonNullable<LayoutData['header']>['links']>('/api/nav/links'),
      footer: this.http.get<LayoutData['footer']>('/api/footer'),
    }).pipe(
      map(({ dropdowns, links, footer }) => ({
        header: {
          logoHref: HEADER_LOGO_HREF,
          dropdowns,
          links,
          signIn: HEADER_SIGN_IN,
        },
        footer,
      })),
    );
  }
}
```

Bind the result the same way as Step 7.

---

### Optional: Plain vs signals (cheat sheet)

| | Step 6A / 7A (plain + RxJS) | Step 6B / 7B (signals) |
| --- | --- | --- |
| Angular | 16+ | 16.1+ |
| Static layout | `layoutData = { ... }` | `layoutData = signal({ ... })` |
| Template | `[layout]="layoutData"` | `[layout]="layoutData()"` |
| HTTP layout | `layout$` + `\| async` | `layout = toSignal(loadLayout())` |
| Update signed in | `this.signedIn = true` | `this.signedIn.set(true)` |

Full code for both variants: **Step 6** and **Step 7** above, and [angular.md §5](./angular.md#5-layout-shell--pick-one).

---

### Optional: Central layout service (BehaviorSubject)

Use when multiple components need the same layout or you update it imperatively:

```ts
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import layoutFixture from 'weg-shared-layout/dummy-data.json';

import { HEADER_LOGO_HREF, HEADER_SIGN_IN } from './auth';
import type { LayoutData } from './layout.types';

@Injectable({ providedIn: 'root' })
export class LayoutService {
  private readonly layoutSubject = new BehaviorSubject(
    this.withAppHeaderOverrides(layoutFixture),
  );

  readonly layout$ = this.layoutSubject.asObservable();

  setLayout(data: LayoutData): void {
    this.layoutSubject.next(this.withAppHeaderOverrides(data));
  }

  private withAppHeaderOverrides(data: LayoutData): LayoutData {
    return {
      ...data,
      header: {
        ...data.header,
        logoHref: HEADER_LOGO_HREF,
        signIn: HEADER_SIGN_IN,
      },
    };
  }
}
```

---

### Optional: Update layout at runtime

Stencil watches the `layout` **property**. Assign a **new object reference** when data changes:

```ts
// Good
this.layoutData = {
  ...this.layoutData,
  header: { ...this.layoutData.header, links: newLinks },
};

// Risky — may not re-render
this.layoutData.header!.links!.push(newLink);
```

With `OnPush` and plain fields, call `ChangeDetectorRef.markForCheck()` after updates.

---

### Optional: Imperative assignment (`@ViewChild`)

Rare — use when property binding is blocked (legacy wrapper):

```ts
import {
  AfterViewInit,
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  ElementRef,
  ViewChild,
} from '@angular/core';
import layoutFixture from 'weg-shared-layout/dummy-data.json';
import type { LayoutData } from './layout.types';

@Component({
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <weg-header #header></weg-header>
    <weg-footer #footer></weg-footer>
  `,
})
export class ShellComponent implements AfterViewInit {
  @ViewChild('header', { read: ElementRef }) headerRef!: ElementRef<HTMLElement>;
  @ViewChild('footer', { read: ElementRef }) footerRef!: ElementRef<HTMLElement>;

  layoutData: LayoutData = layoutFixture;

  ngAfterViewInit(): void {
    const header = this.headerRef.nativeElement as HTMLElement & {
      layout?: LayoutData;
    };
    header.layout = this.layoutData;
    (this.footerRef.nativeElement as HTMLElement & { layout?: LayoutData }).layout =
      this.layoutData;
  }
}
```

---

### Optional: NgModule bootstrap

**`src/main.ts`:**

```ts
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { defineCustomElements } from 'weg-shared-layout/loader';

import { AppModule } from './app/app.module';

defineCustomElements();

platformBrowserDynamic()
  .bootstrapModule(AppModule)
  .catch((err) => console.error(err));
```

**`src/app/app.module.ts`:**

```ts
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { App } from './app';

@NgModule({
  declarations: [App],
  imports: [BrowserModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  bootstrap: [App],
})
export class AppModule {}
```

Steps 4–9 are the same; declare the shell component in `declarations` instead of `imports: [App]`.

---

### Optional: Testing

In test setup:

```ts
import { defineCustomElements } from 'weg-shared-layout/loader';

beforeAll(() => {
  defineCustomElements();
});
```

Before assertions:

```ts
await Promise.all([
  customElements.whenDefined('weg-header'),
  customElements.whenDefined('weg-footer'),
]);

fixture.detectChanges();
await fixture.whenStable();

const header = fixture.nativeElement.querySelector('weg-header') as HTMLElement & {
  layout?: LayoutData;
};

expect(header.layout?.header?.signIn).toEqual(HEADER_SIGN_IN);
```

Full example: [weg-angular-demo `app.spec.ts`](https://github.com/jobsac/weg-angular-demo/blob/main/src/app/app.spec.ts).

---

### Optional: Server-side rendering (SSR)

Guard registration in `main.ts`:

```ts
import { defineCustomElements } from 'weg-shared-layout/loader';

if (typeof window !== 'undefined') {
  defineCustomElements();
}
```

Layout JSON can be fetched on the server; custom elements render after client hydration.

---

## Footer

`<weg-footer>` only needs `[layout]` with the same object as the header:

```html
<weg-footer [layout]="layoutData"></weg-footer>
```

External `https://` links open in a new tab automatically.

---

## Troubleshooting

| Symptom | Likely cause | Fix |
| --- | --- | --- |
| `'weg-header' is not a known element` | Missing schema | `CUSTOM_ELEMENTS_SCHEMA` on the component that owns the template |
| Header/footer completely empty | Not registered | `defineCustomElements()` before bootstrap, or tag side-effect imports |
| Tags render, nav empty | Wrong `layout` | `[layout]="..."` with object `{ header?, footer? }` |
| Passed array to `[layout]` | Top-level must be object | `{ header: { links: myArray } }` — see [Optional: API returns separate arrays](#optional-api-returns-separate-arrays-not-one-layout-object) |
| Auth always Sign in | `signedIn` not bound / false | Bind session; set `true` when logged in |
| Generic Manage Account | `userName` missing | Pass first name when `signedIn` is true |
| Layout changes ignored | In-place mutation | New object reference |
| Brief empty header with `async` | Observable not emitted yet | `@if (layout$ \| async; as layout)` or `BehaviorSubject` default |
| Tests fail | Elements undefined | `defineCustomElements()` in `beforeAll` |
| SSR `document is not defined` | Loader on server | `typeof window !== 'undefined'` guard |
| Missing social icons | Bad `platform` | Exactly `LinkedIn`, `Instagram`, `TikTok`, `YouTube` |
| Missing dropdown | Normalization | Non-empty `label` and valid `items` |

### DevTools

```js
$0.layout
$0.signedIn
$0.userName
```

---

## Quick reference

### File map (standalone app)

| File | Role |
| --- | --- |
| `src/main.ts` | `defineCustomElements()` then bootstrap |
| `tsconfig.app.json` | `resolveJsonModule: true` |
| `src/app/auth.ts` | `HEADER_SIGN_IN`, `ACCOUNT_LOGIN_HREF`, `HEADER_LOGO_HREF` |
| `src/app/layout.types.ts` | `export type LayoutData = typeof layoutFixture` |
| `src/app/layout.service.ts` | HTTP / API mapping (Step 7, optional arrays) |
| `src/app/app.ts` | Shell: schema, layout, auth handler |
| `src/app/app.html` | `<weg-header>`, `<router-outlet>`, `<weg-footer>` |

### Minimal template

```html
<weg-header
  [layout]="layoutData"
  [signedIn]="signedIn"
  [userName]="userName"
  (wegAuthClick)="onAuthClick($event)"
></weg-header>

<router-outlet></router-outlet>

<weg-footer [layout]="layoutData"></weg-footer>
```

### Related docs

- [Quick start (angular.md)](./angular.md)
- [Package readme](../readme.md)
- [Plain HTML / vanilla JS](./vanilla.md)
- [React SPA](./react.md)
- [Reference demo app](https://github.com/jobsac/weg-angular-demo)
