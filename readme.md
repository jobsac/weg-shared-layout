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

Full reference: [`src/assets/dummy-data.json`](src/assets/dummy-data.json). This package keeps auth URLs in [`src/constants/weg-urls.ts`](src/constants/weg-urls.ts) for the signed-in nav and docs — **host apps should define their own constants file** (e.g. `auth.ts`) rather than importing from the package.

```json
{
  "header": {
    "logoHref": "…",
    "dropdowns": [{ "label": "Find a job", "items": [{ "label": "Graduates", "href": "…" }] }],
    "links": [{ "label": "Career advice", "href": "…" }, { "label": "Register", "href": "…" }],
    "signIn": { "label": "Sign in", "href": "…" }
  },
  "footer": {
    "social": [{ "platform": "LinkedIn", "href": "…" }],
    "columns": [{ "links": [{ "label": "About WEG", "href": "…" }] }],
    "credits": "…",
    "copyright": "…"
  }
}
```

Use **`dummy-data.json`** for full production URLs. In your app, keep sign-in/out URLs in a local constants file:

```ts
// auth.ts (host app — example)
export const HEADER_SIGN_IN = {
  label: 'Sign in',
  href: 'https://account.warwickemploymentgroup.com/account/login',
};

export const ACCOUNT_LOGIN_HREF = HEADER_SIGN_IN.href;
```

| Field | Used when | Notes |
| --- | --- | --- |
| `header.logoHref` | Always (signed out) | Logo link target. Defaults to WEG home if omitted. Logo image is bundled. |
| `header.dropdowns` | Signed out | CMS-managed dropdown menus |
| `header.links` | Signed out | CMS-managed flat nav links |
| `header.signIn` | Signed out | Sign in button label + href |
| `footer.*` | Always | Social, columns, credits, copyright |

### Auth (Sign in / Sign out)

**Signed out** (`signed-in` false): renders `dropdowns`, `links`, and `signIn` from `layout`.

**Signed in** (`signed-in` true): **ignores** CMS nav and shows built-in links:

- Find a job
- Dashboard
- Manage Account (profile icon + `user-name`, or "Manage Account" if omitted)
- Sign out (with icon)

Set **`signed-in`** from your app session state. Pass **`user-name`** with the user's first name for Manage Account.

Listen for **`wegAuthClick`** to handle sign-in routing or sign-out logic. Call `event.preventDefault()` to stop default navigation.

```js
// auth.ts
const HEADER_SIGN_IN = {
  label: 'Sign in',
  href: 'https://account.warwickemploymentgroup.com/account/login',
};

header.signedIn = true;
header.userName = 'Alex';
header.addEventListener('wegAuthClick', (event) => {
  event.preventDefault();
  if (event.detail.action === 'sign-out') logout();
  else window.location.href = layout.header.signIn?.href ?? HEADER_SIGN_IN.href;
});
```

- **From npm:** `import layout from 'weg-shared-layout/dummy-data.json'` (enable `resolveJsonModule` in TypeScript if needed).
- **In this repo:** [`src/assets/dummy-data.json`](src/assets/dummy-data.json)

## Framework guides

| Guide | Doc |
| --- | --- |
| Angular | [docs/angular.md](./docs/angular.md) |
| React (SPA, client-only) | [docs/react.md](./docs/react.md) |
| Next.js (App Router) | [docs/nextjs.md](./docs/nextjs.md) |
| Plain HTML / vanilla JS | [docs/vanilla.md](./docs/vanilla.md) |

## Publishing (maintainers)

**`npm publish` does not run `npm run build` by itself** — it packs what is on disk. This package uses a **`prepack`** script so a full Stencil build runs before every `npm pack` / `npm publish`, avoiding incomplete tarballs.

Details, checklist, and CI notes: **[docs/publishing.md](./docs/publishing.md)**.
