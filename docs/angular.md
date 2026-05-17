# Angular

Assumes Angular 17+ with **standalone** components (default for `ng new`).

## 1. Install

```bash
npm i weg-shared-layout
```

## 2. Register custom elements (once, before bootstrap)

In `src/main.ts`, call `defineCustomElements()` **before** `bootstrapApplication` so the browser recognises `<weg-footer>`.

```ts
import { bootstrapApplication } from '@angular/platform-browser';
import { defineCustomElements } from 'weg-shared-layout/loader';

import { appConfig } from './app/app.config';
import { App } from './app/app';

defineCustomElements();

bootstrapApplication(App, appConfig).catch((err) => console.error(err));
```

If `defineCustomElements` is async in your Stencil build, `await` it (or chain `.then()`) before bootstrapping so the custom element is defined before the first render.

## 3. Allow custom elements in templates

Add `schemas: [CUSTOM_ELEMENTS_SCHEMA]` to every `@Component` whose template uses `<weg-footer>` (it does not cascade from the root through `router-outlet` children).

## 4. Pass layout with property binding

Use **`[layout]="..."`** so Angular sets the element’s JavaScript `layout` property (Stencil `@Prop()`), not an HTML attribute.

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
<weg-footer [layout]="layoutData()"></weg-footer>
```

Enable `resolveJsonModule` in the TypeScript config used by the app (e.g. `tsconfig.app.json`) if you import `dummy-data.json`.

In production, replace `layoutFixture` with data from your own services; keep the same object shape as `dummy-data.json`.

### Alternative: register only `<weg-footer>`

To avoid the full lazy bundle (e.g. simpler bundling with some dev servers), you can side-effect import the custom-elements bundle instead of the loader:

```ts
import 'weg-shared-layout/weg-footer';
```

Then bootstrap as usual (no `defineCustomElements()` call required for that tag).

## Troubleshooting

| Symptom | Cause / fix |
| --- | --- |
| `'weg-footer' is not a known element` | Add `schemas: [CUSTOM_ELEMENTS_SCHEMA]` on the component whose template contains `<weg-footer>`. |
| Footer missing or empty box | `defineCustomElements()` not called before bootstrap (or footer bundle not imported), or `layout` not set / wrong shape — compare with `dummy-data.json`. |
| SSR: `document is not defined` | Guard `defineCustomElements()` with `typeof window !== 'undefined'` or `isPlatformBrowser`. |

## TypeScript typings

```ts
/// <reference types="weg-shared-layout/dist/types/components" />
```

## Legacy `NgModule`

Add `CUSTOM_ELEMENTS_SCHEMA` once on the module that declares components using `<weg-footer>`. `defineCustomElements()` in `main.ts` is still required when using the loader.
