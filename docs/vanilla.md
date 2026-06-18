# Plain HTML / vanilla JS

## What you get

| Tag | Purpose |
| --- | --- |
| `<weg-header>` | Site header — bundled logo, CMS nav (signed out), built-in nav (signed in), Sign in / Manage Account / Sign out |
| `<weg-footer>` | Site footer — social links, menu, credits, copyright |

Both components are **presentational**: they do **not** fetch data. Pass the same `layout` payload to each.

Payload shape: [`dummy-data.json`](../src/assets/dummy-data.json) (see [readme](../readme.md#how-it-works)).

## Install & register

With a bundler that resolves `node_modules` and package **`exports`** (TypeScript: `resolveJsonModule` + `moduleResolution` `bundler` or `node16` — see [angular.md](./angular.md)):

```html
<weg-header id="header"></weg-header>
<main><!-- your content --></main>
<weg-footer id="footer"></weg-footer>

<script type="module">
  import { defineCustomElements } from 'weg-shared-layout/loader';
  import layout from 'weg-shared-layout/dummy-data.json';

  defineCustomElements();

  const header = document.getElementById('header');
  const footer = document.getElementById('footer');

  header.layout = layout;
  footer.layout = layout;

  function updateCurrentPath() {
    const { pathname, search } = window.location;
    header.currentPath = search ? `${pathname}${search}` : pathname;
  }

  updateCurrentPath();
  window.addEventListener('popstate', updateCurrentPath);
</script>
```

Side-effect imports (no loader) if you only need specific tags:

```js
import 'weg-shared-layout/weg-header';
import 'weg-shared-layout/weg-footer';
```

## `layout` property vs attribute

Assign the **`layout` JavaScript property** (recommended):

```js
element.layout = layoutObject;
```

Or pass a JSON **string** on the `layout` attribute:

```html
<weg-header layout='{"header":{"menu":[]}}'></weg-header>
```

## Header layout fields (signed out)

| Field | Purpose |
| --- | --- |
| `header.logoSrc` | Logo image URL (bundled if omitted) |
| `header.logoHref` | Logo link URL (WEG homepage if omitted) |
| `header.menu` | Unified nav — groups with `items[]`, flat links with `href` (incl. Sign in) |

See [`dummy-data.json`](../src/assets/dummy-data.json) for production URL examples.

## Header auth (Sign in / Sign out)

### Signed out

Renders `header.menu` from `layout`. Add sign-in as a normal link — `{ "label": "Sign in", "href": "…" }` — like Register. The header recognizes it by label or login URL and follows `href` on click.

### Signed in

Set **`signedIn`** and optionally **`userName`**. CMS nav is ignored; built-in links are shown (Find a job, Dashboard, Manage Account, Sign out). Set **`accountBaseUrl`** when account links should use a non-production portal.

```js
header.signedIn = true;
header.userName = 'Alex';
// header.accountBaseUrl = 'https://account-staging.example.com';
// or
header.setAttribute('signed-in', '');
header.setAttribute('user-name', 'Alex');
```

Listen for **`wegAuthClick`** to handle sign-out (call your logout API, then redirect):

```js
header.addEventListener('wegAuthClick', async (event) => {
  if (event.detail.action !== 'sign-out') return;

  event.preventDefault();
  header.signedIn = false;
  await logout();
  window.location.assign('/');
});
```

| `event.detail.action` | Default behaviour if not prevented |
| --- | --- |
| `'sign-in'` | Browser follows the link's `href` |
| `'sign-out'` | Emits event only — no navigation (host handles logout) |

## Nav active state

Set **`currentPath`** (property) or **`current-path`** (attribute) to the current pathname. Include `?query` when dropdown links use search params.

```js
function syncCurrentPath() {
  const { pathname, search } = window.location;
  header.currentPath = search ? `${pathname}${search}` : pathname;
}

syncCurrentPath();
window.addEventListener('popstate', syncCurrentPath);
```

| Link type | Match rule |
| --- | --- |
| Flat nav link | Prefix match on pathname |
| Dropdown child | Exact pathname (+ query when href has `?`) |
| Dropdown parent | Active when any child matches |
| Sign in / Sign out | Never highlighted |

Active links use **`weg-purple-200`** (`#CDCFF8`).

Logo **image** uses `header.logoSrc` (bundled if omitted). Logo **link** uses `header.logoHref` when provided; otherwise it goes to the WEG homepage.

## Without a bundler

Copy `dummy-data.json` to your static assets, `fetch` it, parse JSON, then assign properties:

```js
const res = await fetch('/assets/dummy-data.json');
const layout = await res.json();
document.getElementById('header').layout = layout;
document.getElementById('footer').layout = layout;
```

## See also

- **[Documentation index](./README.md)**
- **[React SPA](./react.md)**
- **[Next.js App Router](./nextjs.md)**
- **[Angular](./angular.md)** · **[Angular 16 demo](../demo/angular16/README.md)**
- **[Package readme](../readme.md)**
