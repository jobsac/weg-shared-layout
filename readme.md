# weg-shared-layout

Shared layout Web Components built with Stencil.

## Install

```bash
npm i weg-shared-layout
# or
pnpm add weg-shared-layout
```

## What this package contains

`weg-shared-layout` publishes two presentational Web Components:

- `<weg-header>`
- `<weg-footer>`

They do not fetch their own content. Your app loads layout data, maps it into the expected shape, and passes the same `layout` object to both components.

## WEG21 API flow

The package includes helpers for the WEG CMS WEG21 API:

| Endpoint | Purpose |
| --- | --- |
| `GET https://warwickemploymentgroup.com/api/v1/weg21` | Footer copy, social links, and additional bootstrap metadata such as logo/favicon URLs |
| `GET https://warwickemploymentgroup.com/api/v1/weg21/menus` | Header nav (`ext` / `int`) and footer link columns |

Use `fetchWeg21Layout()` to fetch and map both endpoints:

```ts
import { fetchWeg21Layout } from 'weg-shared-layout/menus';

const layout = await fetchWeg21Layout({
  apiKey: process.env.WCMS_API_KEY,
});
```

You can also work offline with the bundled schema fixtures:

- `weg-shared-layout/weg21-bootstrap.json`
- `weg-shared-layout/weg21-menus.json`

Map those with `dummyWeg21LayoutData()` or `menusToLayoutData()`.

## Layout shape

```json
{
  "header": {
    "menu": [
      { "label": "Find a job", "items": [{ "label": "Graduates", "href": "…" }] },
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

| Field | Notes |
| --- | --- |
| `header.logoSrc` | Optional logo image URL; bundled logo is used when omitted |
| `header.logoHref` | Optional logo link URL; defaults to the WEG homepage |
| `header.menu` | Mixed array of groups (`items`) and flat links (`href`) |
| `footer.menu` | `LayoutLink[][]` where each inner array is a footer column |
| `footer.social` | LinkedIn, Instagram, TikTok, or YouTube links |
| `footer.credits` / `footer.copyright` | Footer legal copy |

## Header auth behavior

When `signed-in` is `false`, the header renders `layout.header.menu` directly. Sign-in should be represented as a normal CMS link such as `{ "label": "Sign in", "href": "…" }`.

When `signed-in` is `true`, the component still uses `layout.header.menu` if you provide one. If `layout.header.menu` is empty, it falls back to the built-in signed-in menu: Find a job, Dashboard, Manage Account, and Sign out.

Pass:

- `signed-in` from your app session state
- `user-name` for the signed-in Manage Account label
- `account-base-url` only when using the built-in signed-in fallback menu against a non-production account portal
- `current-path` to highlight the active nav item

Sign-out emits `wegAuthClick`. The host app should call `event.preventDefault()` and run logout + redirect itself.

```js
header.addEventListener('wegAuthClick', async (event) => {
  if (event.detail.action !== 'sign-out') return;
  event.preventDefault();
  await logout();
  window.location.assign('/');
});
```

## Nav active state

| Link type | Match rule |
| --- | --- |
| Flat nav link | Prefix match, so `/career-advice` matches `/career-advice/foo` |
| Dropdown child | Exact pathname, plus query string when the href includes `?` |
| Dropdown parent | Active background when any child matches |
| Sign in / Sign out | Never highlighted |

Active links use `weg-purple-200` (`#CDCFF8`). Omit `current-path` to disable active styling.

## Package entry points

| Import | Purpose |
| --- | --- |
| `weg-shared-layout/loader` | `defineCustomElements()` for registering all tags |
| `weg-shared-layout/menus` | `fetchWeg21Layout`, `menusToLayoutData`, `dummyWeg21LayoutData` |
| `weg-shared-layout/menus-data` | WEG21 API response types |
| `weg-shared-layout/layout-data` | `layout` prop types |
| `weg-shared-layout/weg21-bootstrap.json` | Sample `GET /api/v1/weg21` payload |
| `weg-shared-layout/weg21-menus.json` | Sample `GET /api/v1/weg21/menus` payload |
| `weg-shared-layout/weg-header` / `weg-footer` | Side-effect imports for individual tags |
| `weg-shared-layout/hydrate` | Stencil hydrate build for server-side rendering workflows |
| `weg-shared-layout/styles/container.css` | Shared `.container` layout utility |
| `weg-shared-layout` | Root package export with generated JSX/component typings plus `format()` |

## Documentation

See **[docs/README.md](./docs/README.md)** for the full index.

| Guide | Doc |
| --- | --- |
| Angular 16 | [docs/angular.md](./docs/angular.md) |
| Angular 16 demo | [demo/angular16/README.md](./demo/angular16/README.md) |
| React SPA | [docs/react.md](./docs/react.md) |
| Next.js App Router | [docs/nextjs.md](./docs/nextjs.md) |
| Plain HTML / vanilla JS | [docs/vanilla.md](./docs/vanilla.md) |
| Publishing | [docs/publishing.md](./docs/publishing.md) |

## Publishing

`npm publish` does not run a build on its own; it publishes whatever is already on disk. This repo relies on `prepack` so a Stencil build runs before packing or publishing.

For the full release checklist, package contents, and CI notes, see **[docs/publishing.md](./docs/publishing.md)**.
