# Documentation index

Guides for integrating **`weg-shared-layout`** (`<weg-header>`, `<weg-footer>`) in host applications.

Layout shape uses **`header.menu`** (unified nav) and **`footer.menu`** (columns). Reference JSON: [`src/assets/dummy-data.json`](../src/assets/dummy-data.json).

---

## Choose a guide

| Guide | Audience |
| --- | --- |
| **[../readme.md](../readme.md)** | Package overview, install, abbreviated layout shape |
| **[angular-integration-guide.md](./angular-integration-guide.md)** | Angular 16+ — full step-by-step, HTTP, API mapping, testing, SSR |
| **[angular.md](./angular.md)** | Angular quick start (checklist + copy-paste) |
| **[angular-16-compatibility.md](./angular-16-compatibility.md)** | Angular 16 + TS 4.9/5.x — Stencil `.d.ts` errors, `moduleResolution`, subpath imports |
| **[../demo/angular16/README.md](../demo/angular16/README.md)** | **Runnable Angular 16 demo** — same code as npm install (`file:../..` only for maintainers) |
| **[react.md](./react.md)** | React 19+ SPA (Vite, CRA, etc.) |
| **[nextjs.md](./nextjs.md)** | Next.js 13+ App Router |
| **[vanilla.md](./vanilla.md)** | Plain HTML / vanilla JS + bundler |
| **[publishing.md](./publishing.md)** | Maintainers — npm publish, `prepack`, release checklist |

External reference (newer Angular, signals): [weg-angular-demo](https://github.com/jobsac/weg-angular-demo).

---

## Package entry points

Published subpaths (see [`package.json` `exports`](../package.json)):

| Import | Purpose |
| --- | --- |
| `weg-shared-layout/loader` | **`defineCustomElements()`** — register all tags (recommended) |
| `weg-shared-layout/dummy-data.json` | Sample layout JSON + `typeof` for app types |
| `weg-shared-layout/layout-data` | Types only (`LayoutData`, etc.) — no Stencil runtime `.d.ts` |
| `weg-shared-layout/weg-header` | Single-tag side-effect import (needs modern `moduleResolution`) |
| `weg-shared-layout/weg-footer` | Single-tag side-effect import |

TypeScript apps should set **`resolveJsonModule": true`** and **`moduleResolution": "bundler"`** (or `"node16"` / `"nodenext"`). Classic **`"node"`** often fails to resolve these subpaths. See **[angular-16-compatibility.md](./angular-16-compatibility.md)**.

---

## Maintainer scripts

From repo root:

| Script | Action |
| --- | --- |
| `npm run build` | Stencil build → `dist/`, `loader/` |
| `npm run demo:angular16` | Build library + `ng serve` in `demo/angular16` |
| `npm run demo:angular16:build` | Build library + production build of demo |
