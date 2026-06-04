# Angular 16 demo (`weg-shared-layout`)

Minimal Angular **16.2** app that mirrors how a real consumer app integrates the package: npm install, `defineCustomElements`, `[layout]` bindings, and **`import … from 'weg-shared-layout/dummy-data.json'`**.

This folder is also used **in-repo** to smoke-test the library before publish (`file:../..` instead of a registry version).

---

## Replicating in your own Angular 16 app

Copy the same files and settings as this demo. The only difference when developing inside `weg-shared-layout` is how the dependency is declared (see [In-repo vs npm](#in-repo-vs-npm)).

### 1. Install the package

```bash
npm i weg-shared-layout
```

### 2. `package.json` dependency

```json
"weg-shared-layout": "^0.0.26"
```

### 3. `tsconfig.json` (or `tsconfig.app.json`) — required for JSON + subpath imports

Angular 16 apps on **TypeScript 5.0+** (this demo uses **5.1.x**):

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
| `skipLibCheck` | Avoids Stencil `stencil-public-runtime.d.ts` errors on older TS parsers |
| `resolveJsonModule` | Allows `import x from '…/dummy-data.json'` |
| `moduleResolution: "bundler"` | Resolves `package.json` `exports` (e.g. `weg-shared-layout/dummy-data.json`, `weg-shared-layout/loader`) |

`"node16"` / `"nodenext"` also work on TypeScript 5.1+. Classic `"node"` **does not** resolve those subpaths reliably.

More context: [docs/angular-16-compatibility.md](../../docs/angular-16-compatibility.md).

### 4. Register custom elements — `src/main.ts`

```ts
import { defineCustomElements } from 'weg-shared-layout/loader';

defineCustomElements();
// then bootstrapApplication(...)
```

Prefer the **loader** over `import 'weg-shared-layout/weg-header'` side-effect imports (fewer `moduleResolution` surprises).

### 5. Layout types — `src/app/layout.types.ts` (same as this demo)

```ts
import layoutFixture from 'weg-shared-layout/dummy-data.json';

export type LayoutData = typeof layoutFixture;
```

### 6. Load fixture or API — `src/app/layout.service.ts` (same as this demo)

```ts
import layoutFixture from 'weg-shared-layout/dummy-data.json';
import type { LayoutData } from './layout.types';

// layoutFixture for dev; swap for HttpClient GET /api/layout in production
```

Alternatively, import types only:

```ts
import type { LayoutData } from 'weg-shared-layout/layout-data';
```

(requires a published version that exports `./layout-data`; see package `exports`.)

### 7. Shell component

- `CUSTOM_ELEMENTS_SCHEMA` on the component that owns `<weg-header>` / `<weg-footer>`
- `[layout]="…"` property binding (not string `layout="…"`)
- `[signedIn]`, `[userName]`, `(wegAuthClick)` as in `src/app/app.component.*`

Full step-by-step: [docs/angular-integration-guide.md](../../docs/angular-integration-guide.md).

---

## In-repo vs npm

| | Your Angular 16 app | This demo folder |
| --- | --- | --- |
| Dependency | `"weg-shared-layout": "^0.0.26"` from npm | `"weg-shared-layout": "file:../.."` |
| Library build | Not needed (prebuilt in npm tarball) | Run `npm run build` at **repo root** first so `dist/` + `loader/` exist |
| Source code | Same imports and tsconfig as below | **Identical** — no relative `../../../../src/assets/…` shortcuts |

After publish, consumers use the same import paths; only the dependency line in `package.json` changes.

---

## Run this demo (maintainers)

From **repo root**:

```bash
npm install
npm run build
cd demo/angular16
npm install
npm start
```

Or: `npm run demo:angular16` from the repo root.

Open http://localhost:4200/

### After changing the library

```bash
# repo root
npm run build
cd demo/angular16 && npm start
```

Re-run `npm install` in `demo/angular16` only if `package.json` `exports` or version changed.

---

## What this demo implements

| File | Real-app pattern |
| --- | --- |
| `src/main.ts` | `defineCustomElements()` from `weg-shared-layout/loader` |
| `src/app/layout.types.ts` | `typeof` import from `weg-shared-layout/dummy-data.json` |
| `src/app/layout.service.ts` | Same JSON import for runtime fixture data |
| `src/app/app.component.*` | `[layout]`, auth bindings, plain fields (Angular 16, no signals) |
| `tsconfig.json` | `skipLibCheck`, `resolveJsonModule`, `moduleResolution: bundler` |

---

## See also

- [Documentation index](../../docs/README.md)
- [Angular 16 / TS compatibility](../../docs/angular-16-compatibility.md)
- [Angular integration guide](../../docs/angular-integration-guide.md)
- [External reference app](https://github.com/jobsac/weg-angular-demo) (newer Angular; same layout ideas)
