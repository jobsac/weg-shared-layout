# Angular 16 demo

Minimal Angular **16.2** app that mirrors a real consumer install: `defineCustomElements`, `[layout]` bindings, and **`fetchWeg21Layout` from `weg-shared-layout/menus` (falls back to `dummyWeg21LayoutData()`).

Integration steps: **[docs/angular.md](../../docs/angular.md)**.

The demo uses bundled fixture data by default. To enable live CMS data locally, set both the API base URL and your own read-only `wcms-api-key` in `src/app/local-api-key.ts`.

---

## Run (maintainers)

From **repo root**:

```bash
npm install
npm run demo:angular16
```

Open http://localhost:49938/

### Optional: enable live CMS data locally

Edit `src/app/local-api-key.ts` and set:

- `WEG21_API_BASE` to the environment you want to test
- `WEG21_API_KEY` to your own read-only key

The key is still exposed to the browser when you run the demo, so only use a low-risk read-only key here.

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
| `src/app/layout.service.ts` | `fetchWeg21Layout` when `src/app/local-api-key.ts` contains an API base and key, otherwise `dummyWeg21LayoutData()` |
| `src/app/auth.ts` | Sign-out redirect URL constant |
| `src/app/app.component.*` | `[layout]`, `[currentPath]`, auth bindings, plain fields (no signals) |
| `tsconfig.json` | `skipLibCheck`, `resolveJsonModule`, `moduleResolution: bundler` |
