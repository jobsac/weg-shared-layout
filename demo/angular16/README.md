# Angular 16 demo

Minimal Angular **16.2** app that mirrors a real consumer install: `defineCustomElements`, `[layout]` bindings, and `import … from 'weg-shared-layout/dummy-data.json'`.

Integration steps: **[docs/angular.md](../../docs/angular.md)**.

---

## Run (maintainers)

From **repo root**:

```bash
npm install
npm run build
npm run demo:angular16
```

Open http://localhost:4200/

Or manually (uses **npm** — run from this folder):

```bash
cd demo/angular16
npm install
npm start
```

### After changing the library

```bash
# repo root
npm run build
cd demo/angular16 && npm start
```

Re-run `npm install` in `demo/angular16` only if `package.json` `exports` or version changed.

---

## In-repo vs npm

| | Your Angular 16 app | This demo |
| --- | --- | --- |
| Dependency | `"weg-shared-layout": "^0.0.38"` from npm | `"weg-shared-layout": "file:../.."` |
| Library build | Prebuilt in npm tarball | Run `npm run build` at repo root first |
| Source code | Same imports and tsconfig | Identical |

---

## What this demo implements

| File | Pattern |
| --- | --- |
| `src/main.ts` | `defineCustomElements()` from `weg-shared-layout/loader` |
| `src/app/layout.types.ts` | `typeof` import from `weg-shared-layout/dummy-data.json` |
| `src/app/layout.service.ts` | Fixture data (swap for `HttpClient` in production) |
| `src/app/auth.ts` | Sign-out redirect URL constant |
| `src/app/app.component.*` | `[layout]`, auth bindings, plain fields (no signals) |
| `tsconfig.json` | `skipLibCheck`, `resolveJsonModule`, `moduleResolution: bundler` |
