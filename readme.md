# weg-shared-layout

> Shared layout Web Components.

## Install

```bash
npm i weg-shared-layout
```

## How it works

`<weg-header>` and `<weg-footer>` are **presentational** Web Components: they do **not** fetch data.

Load layout from the **WEG CMS WEG21 API**, then pass the mapped object to `layout` on each tag:

| Endpoint | Purpose |
| --- | --- |
| `GET https://warwickemploymentgroup.com/api/v1/weg21` | Logo URLs, footer social + legal copy |
| `GET …/api/v1/weg21/menus` | Header (`ext` / `int`) and footer link columns |

Both require the `wcms-api-key` header. Use `fetchWeg21Layout` from `weg-shared-layout/menus`:

```ts
import { fetchWeg21Layout } from 'weg-shared-layout/menus';

const layout = await fetchWeg21Layout({
  apiKey: process.env.WCMS_API_KEY,
});
// layout.header.menu, layout.footer.menu, layout.footer.social, …
```

[`weg21-bootstrap.json`](src/assets/weg21-bootstrap.json) and [`weg21-menus.json`](src/assets/weg21-menus.json) mirror the **WEG21 API response schemas** (`GET /api/v1/weg21` and `/menus`). Map to `layout` with `dummyWeg21LayoutData()` or `menusToLayoutData`.

### Layout shape (abbreviated)

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

| Field | Used when | Notes |
| --- | --- | --- |
| `header.logoSrc` | Signed out | Optional CMS logo URL; bundled PNG if omitted |
| `header.logoHref` | Always | Optional logo link URL; WEG homepage if omitted |
| `header.menu` | Signed out | Groups use `items`; flat links use `href` |
| `footer.menu` | Always | `LayoutLink[][]` — one column per inner array |
| `footer.social` | Always | LinkedIn, Instagram, TikTok, or YouTube |
| `footer.credits` / `footer.copyright` | Always | Legal copy |

### Auth (Sign in / Sign out)

**Signed out**: renders `header.menu`. Sign-in is a normal link — add `{ "label": "Sign in", "href": "…" }` like Register or Career advice. The header recognizes it by label or login URL and follows `href` on click.

**Signed in** (`signed-in` true): ignores CMS `header.menu` and shows built-in Find a job, Dashboard, Manage Account, and Sign out.

Set **`signed-in`** from your app session state. Pass **`user-name`** for Manage Account. Pass **`account-base-url`** when account links should point at a non-production portal. Pass **`current-path`** (e.g. `/career-advice/my-article`) to highlight the active nav item. **Sign out** emits **`wegAuthClick`** — the host must call `event.preventDefault()` and run your logout flow (API call, clear session, redirect).

### Nav active state

| Link type | Match rule |
| --- | --- |
| Flat nav link | Prefix — `/career-advice` matches `/career-advice/foo` |
| Dropdown child | Exact pathname (+ query when href includes `?`) |
| Dropdown parent | Active background when any child matches |
| Sign in / Sign out | Never highlighted |

Active links use **`weg-purple-200`** (`#CDCFF8`). Omit `current-path` to disable active styling.

```js
header.addEventListener('wegAuthClick', async (event) => {
  if (event.detail.action !== 'sign-out') return;
  event.preventDefault();
  await logout();
  window.location.assign('/');
});
```

### Package imports (TypeScript / bundlers)

| Subpath | Use |
| --- | --- |
| `weg-shared-layout/loader` | `defineCustomElements()` — **recommended** |
| `weg-shared-layout/menus` | `fetchWeg21Layout`, `menusToLayoutData` |
| `weg-shared-layout/menus-data` | WEG21 API types (`MenusData`, …) |
| `weg-shared-layout/layout-data` | `<weg-header>` / `<weg-footer>` types (`LayoutData`, …) |
| `weg-shared-layout/weg21-bootstrap.json` | `GET /api/v1/weg21` schema sample |
| `weg-shared-layout/weg21-menus.json` | `GET /api/v1/weg21/menus` schema sample |
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
