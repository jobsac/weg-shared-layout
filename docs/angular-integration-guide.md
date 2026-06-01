# Angular integration guide

Complete guide for using `weg-shared-layout` in Angular apps — including **Angular 16+**, **without signals**, and when your CMS/API returns **arrays** rather than a single layout object.

For a shorter quick start, see **[angular.md](./angular.md)**. A working reference app lives at [weg-angular-demo](https://github.com/jobsac/weg-angular-demo).

---

## Table of contents

1. [What you are integrating](#1-what-you-are-integrating)
2. [Requirements](#2-requirements)
3. [Signals are not required](#3-signals-are-not-required)
4. [Installation and registration](#4-installation-and-registration)
5. [Allow custom elements in templates](#5-allow-custom-elements-in-templates)
6. [Layout data shape](#6-layout-data-shape)
7. [Passing arrays and mapping API data](#7-passing-arrays-and-mapping-api-data)
8. [Integration patterns (Angular 16+)](#8-integration-patterns-angular-16)
9. [Header: auth, signed-in state, and events](#9-header-auth-signed-in-state-and-events)
10. [Footer](#10-footer)
11. [Updating layout at runtime](#11-updating-layout-at-runtime)
12. [TypeScript configuration](#12-typescript-configuration)
13. [Testing](#13-testing)
14. [Server-side rendering (SSR)](#14-server-side-rendering-ssr)
15. [Troubleshooting](#15-troubleshooting)
16. [Quick reference](#16-quick-reference)

---

## 1. What you are integrating

`weg-shared-layout` ships two **Stencil Web Components**:

| Tag | Purpose |
| --- | --- |
| `<weg-header>` | Site header — bundled logo, CMS nav (signed out), built-in nav (signed in), Sign in / Manage Account / Sign out |
| `<weg-footer>` | Site footer — social links, link columns, credits, copyright |

They are **presentational**: they do **not** fetch data. Your Angular app loads layout JSON (from a CMS, API, or static file) and passes it in.

Angular treats these as **custom elements**. You bind JavaScript **properties** to them — the same way you would in plain JavaScript:

```js
header.layout = { header: { ... }, footer: { ... } };
header.signedIn = true;
header.userName = 'Alex';
```

The components do not know or care whether your app uses signals, RxJS, NgModule, or standalone components. That is entirely Angular-side.

---

## 2. Requirements

| Requirement | Notes |
| --- | --- |
| **Angular 16+** | Tested with standalone and NgModule apps. Angular 17+ docs often use standalone + signals in examples; both are optional here. |
| **Property binding** | Use `[layout]="..."`, not `layout="..."`. Object payloads must be set as DOM properties, not HTML attributes. |
| **`CUSTOM_ELEMENTS_SCHEMA`** | Required on every component template that uses `<weg-header>` or `<weg-footer>`. Does not cascade to routed children. |
| **One-time registration** | Call `defineCustomElements()` (or side-effect import tags) before bootstrap. |

---

## 3. Signals are not required

The package examples and the [weg-angular-demo](https://github.com/jobsac/weg-angular-demo) app sometimes use Angular **signals** (`signal()`, `computed()`) because that is a convenient modern pattern for local reactive state.

**Signals are not part of the integration contract.** The web components accept plain values:

| Demo / docs syntax | What it means | Without signals |
| --- | --- | --- |
| `[layout]="layoutData()"` | Read a signal in the template | `[layout]="layoutData"` |
| `signedIn = signal(false)` | Reactive boolean | `signedIn = false` |
| `userName = computed(...)` | Derived signal | `userName?: string` or a getter |
| `this.signedIn.set(true)` | Update signal | `this.signedIn = true` |

If you see `()` in a template binding, that is **Angular signal invocation**, not something the web component requires.

Use whichever state approach fits your app:

- Plain class fields (simplest)
- RxJS observables + `async` pipe (HTTP, auth streams)
- `BehaviorSubject` in a service
- Signals (Angular 16.1+ / 17+ if you prefer them)

All of these work as long as the bound value reaches the custom element property.

---

## 4. Installation and registration

### Install

```bash
npm i weg-shared-layout
# or
pnpm add weg-shared-layout
```

### Register custom elements (once, before bootstrap)

In `src/main.ts`, call `defineCustomElements()` **before** `bootstrapApplication` or `platformBrowserDynamic().bootstrapModule(...)`:

```ts
import { bootstrapApplication } from '@angular/platform-browser';
import { defineCustomElements } from 'weg-shared-layout/loader';

import { appConfig } from './app/app.config';
import { App } from './app/app';

defineCustomElements();

bootstrapApplication(App, appConfig).catch((err) => console.error(err));
```

**NgModule bootstrap (Angular 16 and earlier style):**

```ts
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { defineCustomElements } from 'weg-shared-layout/loader';

import { AppModule } from './app/app.module';

defineCustomElements();

platformBrowserDynamic()
  .bootstrapModule(AppModule)
  .catch((err) => console.error(err));
```

### Alternative: side-effect imports (no loader call)

Import only the tags you need. The browser registers them when the module loads:

```ts
import 'weg-shared-layout/weg-header';
import 'weg-shared-layout/weg-footer';
```

You still need one of these approaches exactly once per app load.

---

## 5. Allow custom elements in templates

Angular's template compiler does not know about `<weg-header>` and `<weg-footer>` unless you opt in.

Add `schemas: [CUSTOM_ELEMENTS_SCHEMA]` to **every `@Component` (or `@NgModule`) whose template uses these tags**.

### Standalone component

```ts
import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

@Component({
  selector: 'app-root',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './app.html',
})
export class App {}
```

### NgModule app

```ts
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

@NgModule({
  declarations: [AppComponent, ShellComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  bootstrap: [AppComponent],
})
export class AppModule {}
```

**Important:** If `<weg-header>` lives in `AppComponent` but routed pages are separate components, you only need the schema on `AppComponent` (or whichever component owns the template). Routed children do **not** inherit the schema from a parent shell unless the schema is on their own module/component.

---

## 6. Layout data shape

Both `<weg-header>` and `<weg-footer>` accept a single `layout` property.

TypeScript types (from the package source):

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

Full production example: [`src/assets/dummy-data.json`](../src/assets/dummy-data.json).

Import it during development:

```ts
import layoutFixture from 'weg-shared-layout/dummy-data.json';
```

Or load the same shape from your CMS, e.g. [`GET /api/layout`](https://weg-payload-test.vercel.app/api/layout).

### Abbreviated JSON shape

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
| `header.logoHref` | Signed **out** | Logo link target. Defaults to WEG home if omitted. Logo **image** is bundled in the component. |
| `header.dropdowns` | Signed **out** | Dropdown menus (`label` + `items[]`) |
| `header.links` | Signed **out** | Flat nav links |
| `header.signIn` | Signed **out** | Sign in button label + href |
| `header.signOut` | Rarely (signed-out CMS nav) | Optional; signed-in sign-out uses built-in URLs |
| `footer.social` | Always | `platform` must be exactly `LinkedIn`, `Instagram`, `TikTok`, or `YouTube` |
| `footer.columns` | Always | Array of `{ links: [...] }` |
| `footer.credits` | Always | Text below columns |
| `footer.copyright` | Always | Copyright line |

When **`signed-in` is true**, `<weg-header>` **ignores** `dropdowns`, `links`, and `signIn` from layout and shows built-in signed-in navigation instead (Find a job, Dashboard, Manage Account, Sign out).

### Property binding vs HTML attributes

Always use Angular **property binding** (square brackets):

```html
<!-- Correct: sets the JavaScript `layout` property -->
<weg-header [layout]="layoutData"></weg-header>

<!-- Wrong: passes a string attribute; object data will not work -->
<weg-header layout="{{ layoutData }}"></weg-header>
```

The `layout` prop also accepts a **JSON string** (parsed internally), but passing a real object via `[layout]` is preferred in Angular.

---

## 7. Passing arrays and mapping API data

### You cannot pass a bare array to `[layout]`

The top-level `layout` value must be an **object** with optional `header` and `footer` keys — not an array.

```ts
// Will NOT work — header renders empty
const navLinks = [
  { label: 'Career advice', href: '/career-advice' },
  { label: 'Register', href: '/register' },
];

// template: [layout]="navLinks"  ❌
```

If you pass an array, the component treats it as layout data, finds no `.header` / `.footer`, and normalizes to empty navigation.

### Arrays belong *inside* the layout object

These fields **are** arrays and are expected that way:

| Field | Array element shape |
| --- | --- |
| `header.dropdowns` | `{ label: string, items: { label, href }[] }` |
| `header.links` | `{ label: string, href: string }` |
| `footer.social` | `{ platform: 'LinkedIn' \| ..., href: string }` |
| `footer.columns` | `{ links: { label, href }[] }` |

### Mapping separate API responses into layout

If your backend returns nav items, footer columns, etc. as separate endpoints or arrays, assemble the layout object in a service before binding:

```ts
// layout.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, forkJoin } from 'rxjs';

import { HEADER_LOGO_HREF, HEADER_SIGN_IN } from './auth';

export interface LayoutData {
  header?: {
    logoHref?: string;
    dropdowns?: { label: string; items: { label: string; href: string }[] }[];
    links?: { label: string; href: string }[];
    signIn?: { label: string; href: string };
  };
  footer?: {
    social?: { platform: string; href: string }[];
    columns?: { links: { label: string; href: string }[] }[];
    credits?: string;
    copyright?: string;
  };
}

@Injectable({ providedIn: 'root' })
export class LayoutService {
  constructor(private http: HttpClient) {}

  /** CMS already returns the full layout object */
  loadLayout() {
    return this.http.get<LayoutData>('/api/layout');
  }

  /** CMS returns separate pieces — map them here */
  loadLayoutFromParts() {
    return forkJoin({
      dropdowns: this.http.get<{ label: string; items: { label: string; href: string }[] }[]>('/api/nav/dropdowns'),
      links: this.http.get<{ label: string; href: string }[]>('/api/nav/links'),
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
      } satisfies LayoutData)),
    );
  }
}
```

Template:

```html
<weg-header
  [layout]="layout$ | async"
  [signedIn]="signedIn$ | async"
  [userName]="userName$ | async"
  (wegAuthClick)="onAuthClick($event)"
></weg-header>

<weg-footer [layout]="layout$ | async"></weg-footer>
```

### Overriding CMS values with app constants

Host apps should define auth URLs locally (not import from the package). Merge constants when building layout:

```ts
import layoutFixture from 'weg-shared-layout/dummy-data.json';
import { HEADER_LOGO_HREF, HEADER_SIGN_IN } from './auth';

const layoutData: LayoutData = {
  ...layoutFixture,
  header: {
    ...layoutFixture.header,
    logoHref: HEADER_LOGO_HREF,
    signIn: HEADER_SIGN_IN,
  },
};
```

Example `auth.ts`:

```ts
export const HEADER_LOGO_HREF = 'https://www.warwickemploymentgroup.com/';

export const HEADER_SIGN_IN = {
  label: 'Sign in',
  href: 'https://account.warwickemploymentgroup.com/account/login',
};

export const HEADER_SIGN_OUT_HREF = HEADER_SIGN_IN.href;
```

### Invalid entries are silently dropped

The components normalize input defensively:

- Link arrays skip items missing `label` or `href`
- Dropdowns skip items with empty `items`
- Footer social links skip unknown `platform` values
- Empty or malformed input becomes empty nav/footer sections (no throw)

Check your mapped object in DevTools if nav appears empty.

---

## 8. Integration patterns (Angular 16+)

### Pattern A — Plain properties (simplest, static or manually updated)

No signals, no RxJS. Good for fixtures, SSR-resolved data, or simple toggles.

```ts
// app.component.ts
import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import layoutFixture from 'weg-shared-layout/dummy-data.json';
import { HEADER_SIGN_IN, HEADER_SIGN_OUT_HREF } from './auth';

@Component({
  selector: 'app-root',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './app.component.html',
})
export class AppComponent {
  layoutData = layoutFixture;
  signedIn = false;
  userName?: string;

  toggleSignedIn(): void {
    this.signedIn = !this.signedIn;
    this.userName = this.signedIn ? 'Alex' : undefined;
  }

  onAuthClick(event: Event): void {
    const customEvent = event as CustomEvent<{ action: 'sign-in' | 'sign-out' }>;
    customEvent.preventDefault();

    if (customEvent.detail.action === 'sign-out') {
      this.signedIn = false;
      window.location.href = HEADER_SIGN_OUT_HREF;
      return;
    }

    window.location.href =
      this.layoutData.header?.signIn?.href ?? HEADER_SIGN_IN.href;
  }
}
```

```html
<!-- app.component.html -->
<weg-header
  [layout]="layoutData"
  [signedIn]="signedIn"
  [userName]="userName"
  (wegAuthClick)="onAuthClick($event)"
></weg-header>

<router-outlet></router-outlet>

<weg-footer [layout]="layoutData"></weg-footer>
```

Note: no `()` on bindings.

---

### Pattern B — RxJS + `async` pipe (HTTP / auth streams)

Classic Angular 16 approach for async CMS data and session state.

```ts
import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { Observable } from 'rxjs';

import { LayoutService } from './layout.service';
import { AuthService } from './auth.service';

@Component({
  selector: 'app-root',
  imports: [AsyncPipe, RouterOutlet],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './app.component.html',
})
export class AppComponent {
  layout$: Observable<LayoutData>;
  signedIn$: Observable<boolean>;
  userName$: Observable<string | undefined>;

  constructor(
    layoutService: LayoutService,
    authService: AuthService,
  ) {
    this.layout$ = layoutService.loadLayout();
    this.signedIn$ = authService.isSignedIn$;
    this.userName$ = authService.firstName$;
  }

  onAuthClick(event: Event): void {
    // same handler as Pattern A
  }
}
```

```html
<weg-header
  [layout]="layout$ | async"
  [signedIn]="signedIn$ | async"
  [userName]="userName$ | async"
  (wegAuthClick)="onAuthClick($event)"
></weg-header>

<router-outlet></router-outlet>

<weg-footer [layout]="layout$ | async"></weg-footer>
```

Use `shareReplay(1)` on `layout$` if multiple subscribers or child routes need the same payload.

---

### Pattern C — Layout service (with or without signals)

Centralize layout loading and app-specific overrides.

**Without signals (BehaviorSubject):**

```ts
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import layoutFixture from 'weg-shared-layout/dummy-data.json';
import { HEADER_LOGO_HREF, HEADER_SIGN_IN } from './auth';

@Injectable({ providedIn: 'root' })
export class LayoutService {
  private readonly layoutSubject = new BehaviorSubject(this.buildHeaderLayout(layoutFixture));
  readonly layout$ = this.layoutSubject.asObservable();

  get layoutSnapshot() {
    return this.layoutSubject.value;
  }

  setLayout(data: LayoutData): void {
    this.layoutSubject.next(this.buildHeaderLayout(data));
  }

  private buildHeaderLayout(data: LayoutData): LayoutData {
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

**With signals (optional, if your app already uses them):**

```ts
import { computed, Injectable, signal } from '@angular/core';
import layoutFixture from 'weg-shared-layout/dummy-data.json';
import { HEADER_LOGO_HREF, HEADER_SIGN_IN } from './auth';

@Injectable({ providedIn: 'root' })
export class LayoutService {
  readonly layout = signal<LayoutData>(layoutFixture);

  readonly headerLayout = computed(() => ({
    ...this.layout(),
    header: {
      ...this.layout().header,
      logoHref: HEADER_LOGO_HREF,
      signIn: HEADER_SIGN_IN,
    },
  }));
}
```

Both approaches are equivalent from the web component's perspective.

---

### Pattern D — Imperative property assignment (`@ViewChild`)

If property binding is awkward (e.g. legacy wrapper, one-off migration), set properties on the native element directly:

```ts
import {
  AfterViewInit,
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  ElementRef,
  ViewChild,
} from '@angular/core';

@Component({
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <weg-header #header (wegAuthClick)="onAuthClick($event)"></weg-header>
    <weg-footer #footer></weg-footer>
  `,
})
export class ShellComponent implements AfterViewInit {
  @ViewChild('header', { read: ElementRef }) headerRef!: ElementRef<HTMLElement>;
  @ViewChild('footer', { read: ElementRef }) footerRef!: ElementRef<HTMLElement>;

  layoutData = layoutFixture;
  signedIn = false;

  ngAfterViewInit(): void {
    this.applyLayout();
  }

  applyLayout(): void {
    const header = this.headerRef.nativeElement as HTMLElement & {
      layout?: LayoutData;
      signedIn?: boolean;
    };
    header.layout = this.layoutData;
    header.signedIn = this.signedIn;

    (this.footerRef.nativeElement as HTMLElement & { layout?: LayoutData }).layout =
      this.layoutData;
  }
}
```

The Stencil components watch the `layout` property and re-render when it changes.

---

### Pattern E — Shell layout component with routed content

Typical app structure:

```html
<!-- app.component.html -->
<weg-header ...></weg-header>

<main>
  <router-outlet></router-outlet>
</main>

<weg-footer ...></weg-footer>
```

Put header/footer in the root (or a layout route component). Only that component needs `CUSTOM_ELEMENTS_SCHEMA`.

---

## 9. Header: auth, signed-in state, and events

### Inputs and outputs

| Web component attribute | Angular binding | Type | Notes |
| --- | --- | --- | --- |
| `layout` | `[layout]="..."` | `LayoutData` (or JSON string) | CMS nav when signed out |
| `signed-in` | `[signedIn]="..."` | `boolean` | `true` → built-in signed-in nav |
| `user-name` | `[userName]="..."` | `string \| undefined` | First name on Manage Account |
| `wegAuthClick` | `(wegAuthClick)="..."` | `CustomEvent` | `detail.action`: `'sign-in'` \| `'sign-out'` |

Angular maps camelCase bindings (`signedIn`, `userName`) to the kebab-case attributes (`signed-in`, `user-name`) on the custom element.

### Signed-out vs signed-in behaviour

**Signed out** (`signedIn === false`):

- Renders `header.dropdowns`, `header.links`, `header.signIn` from layout
- Logo links to `header.logoHref` (or WEG home default)

**Signed in** (`signedIn === true`):

- Ignores CMS dropdowns/links/signIn
- Shows built-in links: Find a job, Dashboard, Manage Account, Sign out
- Manage Account label uses `userName` if set, otherwise `"Manage Account"`

### Auth click handler

Listen for `(wegAuthClick)` and call `event.preventDefault()` to handle routing yourself:

```ts
onAuthClick(event: Event): void {
  const customEvent = event as CustomEvent<{ action: 'sign-in' | 'sign-out' }>;
  customEvent.preventDefault();

  if (customEvent.detail.action === 'sign-out') {
    this.authService.logout();
    return;
  }

  this.router.navigate(['/login']);
  // or: window.location.href = this.layoutData.header?.signIn?.href ?? HEADER_SIGN_IN.href;
}
```

If you do **not** call `preventDefault()`, the component performs default navigation (redirect to sign-in href or sign-out href).

---

## 10. Footer

`<weg-footer>` only needs `[layout]`. It reads `layout.footer`:

```html
<weg-footer [layout]="layoutData"></weg-footer>
```

Same `layoutData` object as the header is fine — the footer ignores `header`, and the header ignores `footer`.

External footer links (`https://...`) open in a new tab automatically.

---

## 11. Updating layout at runtime

Stencil watches the `layout` **property**. When you replace layout data:

1. **Prefer assigning a new object reference** rather than mutating nested arrays in place.
2. Angular change detection will re-bind `[layout]` when the bound expression changes.

```ts
// Good — new reference, @Watch('layout') fires
this.layoutData = {
  ...this.layoutData,
  header: {
    ...this.layoutData.header,
    links: newLinks,
  },
};

// Risky — in-place mutation may not trigger updates
this.layoutData.header!.links!.push(newLink);
```

With RxJS, emit a new value through your `BehaviorSubject` or re-fetch from the API.

With `OnPush` change detection and plain fields, mark for check after updates:

```ts
constructor(private cdr: ChangeDetectorRef) {}

updateSignedIn(value: boolean): void {
  this.signedIn = value;
  this.cdr.markForCheck();
}
```

---

## 12. TypeScript configuration

### Import `dummy-data.json`

In `tsconfig.app.json` (or `tsconfig.json`):

```json
{
  "compilerOptions": {
    "resolveJsonModule": true
  }
}
```

### Typing layout in your app

Derive types from the fixture so they stay aligned:

```ts
import layoutFixture from 'weg-shared-layout/dummy-data.json';

export type LayoutData = typeof layoutFixture;
```

Or define an explicit interface matching [layout-data.ts](../src/types/layout-data.ts).

There is no separate `@types/weg-shared-layout` — component prop types ship in the package under `dist/types/`.

---

## 13. Testing

Register custom elements once in test setup:

```ts
import { defineCustomElements } from 'weg-shared-layout/loader';

beforeAll(() => {
  defineCustomElements();
});
```

Wait for custom element definition before asserting on DOM:

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

See [weg-angular-demo `app.spec.ts`](https://github.com/jobsac/weg-angular-demo/blob/main/src/app/app.spec.ts) for a full example.

---

## 14. Server-side rendering (SSR)

Guard registration so it only runs in the browser:

```ts
import { defineCustomElements } from 'weg-shared-layout/loader';

if (typeof window !== 'undefined') {
  defineCustomElements();
}
```

Or use Angular's `isPlatformBrowser` in an `APP_INITIALIZER` if you prefer.

Layout data can still be fetched on the server and passed to the client component as serialized state; the custom elements themselves render client-side after hydration.

---

## 15. Troubleshooting

| Symptom | Likely cause | Fix |
| --- | --- | --- |
| `'weg-header' is not a known element` | Missing schema | Add `CUSTOM_ELEMENTS_SCHEMA` on the component (or module) that owns the template |
| Header/footer completely empty | Elements not registered | Call `defineCustomElements()` before bootstrap, or side-effect import tag bundles |
| Header/footer empty but tags render | `layout` not set or wrong shape | Use `[layout]="..."` property binding; verify object has `header` / `footer` keys |
| Passed an array, nav is empty | Top-level `[layout]` must be an object | Wrap arrays: `{ header: { links: myArray } }` |
| Auth always shows Sign in | `[signedIn]` not bound or always `false` | Bind session state; set `true` when logged in |
| Manage Account shows generic label | `[userName]` not set when signed in | Pass user's first name when `signedIn` is true |
| Layout changes not reflected | In-place mutation | Assign a new object reference |
| `[layout]="data \| async"` flickers or is null briefly | Observable not yet emitted | Use `*ngIf="layout$ \| async as layout"` or default via `BehaviorSubject` |
| Works in dev, fails in tests | Custom elements not defined in test bed | Call `defineCustomElements()` in `beforeAll` |
| SSR: `document is not defined` | Loader runs on server | Guard with `typeof window !== 'undefined'` |
| Footer social icons missing | Invalid `platform` string | Must be exactly `LinkedIn`, `Instagram`, `TikTok`, or `YouTube` |
| Dropdown missing | Normalization dropped it | Each dropdown needs non-empty `label` and at least one valid `items` entry |

### Debugging in DevTools

Select the `<weg-header>` element in Elements panel and inspect properties (not attributes):

```js
$0.layout           // should be an object
$0.signedIn         // boolean
$0.userName         // string or undefined
```

If `layout` is `undefined` or a stringified `[object Object]`, you are likely using attribute binding instead of property binding.

---

## 16. Quick reference

### Minimal checklist

- [ ] `npm i weg-shared-layout`
- [ ] `defineCustomElements()` in `main.ts` (before bootstrap)
- [ ] `CUSTOM_ELEMENTS_SCHEMA` on shell component/module
- [ ] `[layout]="layoutObject"` on `<weg-header>` and `<weg-footer>`
- [ ] Layout object shape matches `dummy-data.json` (arrays nested under `header` / `footer`)
- [ ] `[signedIn]` and `[userName]` on header when using auth
- [ ] `(wegAuthClick)` handler with `preventDefault()` if app handles auth
- [ ] Auth URLs in local `auth.ts` (host app constants)

### Minimal template (no signals)

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
