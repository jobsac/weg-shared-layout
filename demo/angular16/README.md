# Angular 16 demo

Minimal Angular **16.2** app that mirrors a real consumer install: `defineCustomElements`, `[layout]` bindings, package-exported WEG21 fixture JSON, and a local layout service that fetches live CMS data when a local API key is configured.

Integration steps: **[docs/angular.md](../../docs/angular.md)**.

The demo uses bundled fixture data by default. To enable live CMS data locally, add your own read-only `wcms-api-key` in `src/app/local-api-key.ts`. The demo already includes a default dev WEG21 API base that you can change if needed.

---

## Run (maintainers)

From **repo root**:

```bash
pnpm install
pnpm run demo:angular16
```

Open http://localhost:49938/

### Optional: enable live CMS data locally

Edit `src/app/local-api-key.ts` and set:

- `WEG21_API_KEY` to your own read-only key
- optionally `WEG21_API_BASE` if you want something other than the current default

The key is still exposed to the browser when you run the demo, so only use a low-risk read-only key here.

Or manually (run from this folder):

```bash
cd demo/angular16
pnpm install
pnpm start
```

### Updating the published package

```bash
cd demo/angular16
pnpm add weg-shared-layout@latest
```

Re-run `pnpm install` in `demo/angular16` when a new `weg-shared-layout` package is published.

---

## In-repo vs npm

| | Your Angular 16 app | This demo |
| --- | --- | --- |
| Dependency | `weg-shared-layout` from npm | `weg-shared-layout` from npm |
| Library build | Prebuilt in npm tarball | Prebuilt in npm tarball |
| Source code | Same imports and tsconfig | Identical |

---

## What this demo implements

| File | Pattern |
| --- | --- |
| `src/main.ts` | `defineCustomElements()` from `weg-shared-layout/loader` |
| `src/app/layout.types.ts` | `LayoutData` from `weg-shared-layout/layout-data` |
| `src/app/layout.service.ts` | Loads bundled JSON fixtures by default; fetches live WEG21 data when `WEG21_API_KEY` is set |
| `src/app/auth.ts` | Sign-out redirect URL constant |
| `src/app/app.component.*` | `[layout]`, `[currentPath]`, auth bindings, plain fields (no signals) |
| `tsconfig.json` | `skipLibCheck`, `resolveJsonModule`, `moduleResolution: bundler` |
