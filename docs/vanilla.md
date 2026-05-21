# Plain HTML / vanilla JS

## What you get

| Tag | Purpose |
| --- | --- |
| `<weg-header>` | Site header — bundled logo, CMS nav (signed out), built-in nav (signed in), Sign in / Manage Account / Sign out |
| `<weg-footer>` | Site footer — social links, columns, credits, copyright |

Both components are **presentational**: they do **not** fetch data. Pass the same `layout` payload to each.

Payload shape: [`dummy-data.json`](../src/assets/dummy-data.json) (see [readme](../readme.md#how-it-works)).

## Install & register

With a bundler that resolves `node_modules` imports:

```html
<weg-header id="header"></weg-header>
<main><!-- your content --></main>
<weg-footer id="footer"></weg-footer>

<script type="module">
  import { defineCustomElements } from 'weg-shared-layout/loader';
  import layout from 'weg-shared-layout/dummy-data.json';
  import { ACCOUNT_LOGIN_HREF, HEADER_SIGN_IN } from './auth.js';

  defineCustomElements();

  const header = document.getElementById('header');
  const footer = document.getElementById('footer');

  header.layout = layout;
  footer.layout = layout;
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
<weg-header layout='{"header":{"links":[]}}'></weg-header>
```

## Header layout fields (signed out)

| Field | Purpose |
| --- | --- |
| `header.logoHref` | Logo link target (defaults to WEG home) |
| `header.dropdowns` | Dropdown menus from CMS |
| `header.links` | Flat nav links from CMS |
| `header.signIn` | Sign in button `{ label, href }` |

See [`dummy-data.json`](../src/assets/dummy-data.json) for production URL examples.

## Header auth (Sign in / Sign out)

Define auth URLs in `./auth.js`:

```js
export const HEADER_SIGN_IN = {
  label: 'Sign in',
  href: 'https://account.warwickemploymentgroup.com/account/login',
};

export const ACCOUNT_LOGIN_HREF = HEADER_SIGN_IN.href;
```

### Signed out

Renders `dropdowns`, `links`, and `signIn` from `layout`.

### Signed in

Set **`signedIn`** and optionally **`userName`**. CMS nav is ignored; built-in links are shown (Find a job, Dashboard, Manage Account, Sign out).

```js
header.signedIn = true;
header.userName = 'Alex';
// or
header.setAttribute('signed-in', '');
header.setAttribute('user-name', 'Alex');
```

Listen for **`wegAuthClick`**:

```js
import { ACCOUNT_LOGIN_HREF, HEADER_SIGN_IN } from './auth.js';

header.addEventListener('wegAuthClick', (event) => {
  event.preventDefault();

  if (event.detail.action === 'sign-out') {
    header.signedIn = false;
    window.location.href = ACCOUNT_LOGIN_HREF;
    return;
  }

  window.location.href = layout.header.signIn?.href ?? HEADER_SIGN_IN.href;
});
```

| `event.detail.action` | Default behaviour if not prevented |
| --- | --- |
| `'sign-in'` | Browser follows `signIn.href` |
| `'sign-out'` | Redirects to built-in sign-out URL |

Logo **image** is bundled. Logo **link** uses `layout.header.logoHref` when signed out.

## Without a bundler

Copy `dummy-data.json` to your static assets, `fetch` it, parse JSON, then assign properties:

```js
const res = await fetch('/assets/dummy-data.json');
const layout = await res.json();
document.getElementById('header').layout = layout;
document.getElementById('footer').layout = layout;
```

## See also

- **[React SPA](./react.md)**
- **[Next.js App Router](./nextjs.md)**
- **[Angular](./angular.md)**
- **[Package readme](../readme.md)**
