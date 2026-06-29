# Angular 16 demo

Minimal Angular **16.2** app that mirrors a real consumer install: `defineCustomElements`, `[layout]` bindings, and **`fetchWeg21Layout` from `weg-shared-layout/menus` (falls back to `dummyWeg21LayoutData()`).

Integration steps: **[docs/angular.md](../../docs/angular.md)**.

The demo points at `https://dev.warwickemploymentgroup.com/api/v1/weg21` and sends `wcms-api-key` for the live CMS data.

---

## Run (maintainers)

From **repo root**:

```bash
npm install
npm run demo:angular16
```

Open http://localhost:49938/

Or manually (uses **npm** — run from this folder):

```bash
cd demo/angular16
npm install
npm start
```

### Updating the published package

```bash
cd demo/angular16
npm install weg-shared-layout@latest
```

Re-run `npm install` in `demo/angular16` when a new `weg-shared-layout` package is published.

---

## In-repo vs npm

| | Your Angular 16 app | This demo |
| --- | --- | --- |
| Dependency | `"weg-shared-layout": "^0.0.50"` from npm | `"weg-shared-layout": "^0.0.50"` from npm |
| Library build | Prebuilt in npm tarball | Prebuilt in npm tarball |
| Source code | Same imports and tsconfig | Identical |

---

## What this demo implements

| File | Pattern |
| --- | --- |
| `src/main.ts` | `defineCustomElements()` from `weg-shared-layout/loader` |
| `src/app/layout.types.ts` | `LayoutData` from `weg-shared-layout/layout-data` |
| `src/app/layout.service.ts` | `fetchWeg21Layout` + `dummyWeg21LayoutData()` fallback |
| `src/app/auth.ts` | Sign-out redirect URL constant |
| `src/app/app.component.*` | `[layout]`, `[currentPath]`, auth bindings, plain fields (no signals) |
| `tsconfig.json` | `skipLibCheck`, `resolveJsonModule`, `moduleResolution: bundler` |
