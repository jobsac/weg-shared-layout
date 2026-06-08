[![Built With Stencil](https://img.shields.io/badge/-Built%20With%20Stencil-16161d.svg?logo=data%3Aimage%2Fsvg%2Bxml%3Bbase64%2CPD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4KPCEtLSBHZW5lcmF0b3I6IEFkb2JlIElsbHVzdHJhdG9yIDE5LjIuMSwgU1ZHIEV4cG9ydCBQbHVnLUluIC4gU1ZHIFZlcnNpb246IDYuMDAgQnVpbGQgMCkgIC0tPgo8c3ZnIHZlcnNpb249IjEuMSIgaWQ9IkxheWVyXzEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHg9IjBweCIgeT0iMHB4IgoJIHZpZXdCb3g9IjAgMCA1MTIgNTEyIiBzdHlsZT0iZW5hYmxlLWJhY2tncm91bmQ6bmV3IDAgMCA1MTIgNTEyOyIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSI%2BCjxzdHlsZSB0eXBlPSJ0ZXh0L2NzcyI%2BCgkuc3Qwe2ZpbGw6I0ZGRkZGRjt9Cjwvc3R5bGU%2BCjxwYXRoIGNsYXNzPSJzdDAiIGQ9Ik00MjQuNywzNzMuOWMwLDM3LjYtNTUuMSw2OC42LTkyLjcsNjguNkgxODAuNGMtMzcuOSwwLTkyLjctMzAuNy05Mi43LTY4LjZ2LTMuNmgzMzYuOVYzNzMuOXoiLz4KPHBhdGggY2xhc3M9InN0MCIgZD0iTTQyNC43LDI5Mi4xSDE4MC40Yy0zNy42LDAtOTIuNy0zMS05Mi43LTY4LjZ2LTMuNkgzMzJjMzcuNiwwLDkyLjcsMzEsOTIuNyw2OC42VjI5Mi4xeiIvPgo8cGF0aCBjbGFzcz0ic3QwIiBkPSJNNDI0LjcsMTQxLjdIODcuN3YtMy42YzAtMzcuNiw1NC44LTY4LjYsOTIuNy02OC42SDMzMmMzNy45LDAsOTIuNywzMC43LDkyLjcsNjguNlYxNDEuN3oiLz4KPC9zdmc%2BCg%3D%3D&colorA=16161d&style=flat-square)](https://stenciljs.com)

# weg-shared-layout

> Shared layout Web Components.

## Install

```bash
npm i weg-shared-layout
```

## How it works

`<weg-header>` and `<weg-footer>` are **presentational** Web Components: they do **not** fetch data.

Load layout JSON from your CMS/API (e.g. [`GET /api/layout`](https://weg-payload-test.vercel.app/api/layout) from WEG CMS) or import [`dummy-data.json`](src/assets/dummy-data.json), then pass it to `layout` on each tag.

### Layout shape (abbreviated)

Full reference: [`src/assets/dummy-data.json`](src/assets/dummy-data.json). Sign-in is a normal `header.menu` entry labelled **Sign in**; it fires `wegAuthClick`. Signed-in nav is built into `<weg-header>` when `signed-in` is true.

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

| Field | Used when | Notes |
| --- | --- | --- |
| `header.logoSrc` | Signed out | Optional CMS logo URL; bundled PNG if omitted |
| `header.menu` | Signed out | Groups use `items`; flat links use `href` |
| `footer.menu` | Always | `LayoutLink[][]` — one column per inner array |
| `footer.social` | Always | LinkedIn, Instagram, TikTok, or YouTube |
| `footer.credits` / `footer.copyright` | Always | Legal copy |

### Auth (Sign in / Sign out)

**Signed out**: renders `header.menu`. The Sign in entry fires `wegAuthClick` with action `sign-in`.

**Signed in** (`signed-in` true): ignores CMS `header.menu` and shows built-in Find a job, Dashboard, Manage Account, and Sign out.

Set **`signed-in`** from your app session state. Pass **`user-name`** for Manage Account.

```js
header.addEventListener('wegAuthClick', (event) => {
  event.preventDefault();
  if (event.detail.action === 'sign-out') logout();
  else window.location.href = HEADER_SIGN_IN.href;
});
```

- **From npm:** `import layout from 'weg-shared-layout/dummy-data.json'` — in TypeScript set `resolveJsonModule` and `moduleResolution` to `bundler` or `node16` (see [docs/angular.md](./docs/angular.md)).
- **In this repo:** [`src/assets/dummy-data.json`](src/assets/dummy-data.json)

### Package imports (TypeScript / bundlers)

| Subpath | Use |
| --- | --- |
| `weg-shared-layout/loader` | `defineCustomElements()` — **recommended** |
| `weg-shared-layout/dummy-data.json` | Sample layout + `typeof` for app types |
| `weg-shared-layout/layout-data` | Types only (`LayoutData`, …) |
| `weg-shared-layout/weg-header` / `weg-footer` | Side-effect tag registration |
| `weg-shared-layout/styles/container.css` | Shared `.container` width and gutter utility |

## Documentation

Full index: **[docs/README.md](./docs/README.md)**.

| Guide | Doc |
| --- | --- |
| Angular 16 | [docs/angular.md](./docs/angular.md) |
| Angular 16 demo (runnable) | [demo/angular16/README.md](./demo/angular16/README.md) |
| React (SPA, client-only) | [docs/react.md](./docs/react.md) |
| Next.js (App Router) | [docs/nextjs.md](./docs/nextjs.md) |
| Plain HTML / vanilla JS | [docs/vanilla.md](./docs/vanilla.md) |
| Publishing (maintainers) | [docs/publishing.md](./docs/publishing.md) |

## Publishing (maintainers)

**`npm publish` does not run `npm run build` by itself** — it packs what is on disk. This package uses a **`prepack`** script so a full Stencil build runs before every `npm pack` / `npm publish`, avoiding incomplete tarballs.

Details, checklist, and CI notes: **[docs/publishing.md](./docs/publishing.md)**.
