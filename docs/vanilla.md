# Plain HTML / vanilla JS

## What you get

| Tag | Purpose |
| --- | --- |
| `<weg-header>` | Site header — logo (bundled), nav dropdowns, flat links, Sign in / Sign out |
| `<weg-footer>` | Site footer — social links, columns, credits, copyright |

Both components are **presentational**: they do **not** fetch data. Pass the same `layout` payload to each (or one shared object on both).

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

Or pass a JSON **string** on the `layout` attribute — the component parses it the same way:

```html
<weg-header layout='{"header":{"links":[]}}'></weg-header>
```

## Header auth (Sign in / Sign out)

The logo is bundled inside `<weg-header>` and cannot be changed via `layout`.

Set **`signedIn`** when the user has a session (maps to the `signed-in` attribute):

```js
header.signedIn = true;
// or
header.setAttribute('signed-in', '');
```

Labels come from `layout.header.signIn` and `layout.header.signOut`:

```json
"signIn": { "label": "Sign in", "href": "/account/login" },
"signOut": { "label": "Sign out" }
```

Listen for **`wegAuthClick`** to handle sign-in routing or sign-out logic:

```js
header.addEventListener('wegAuthClick', (event) => {
  event.preventDefault(); // stop default navigation / redirect

  if (event.detail.action === 'sign-out') {
    // your logout()
    header.signedIn = false;
    return;
  }

  window.location.href = '/account/login';
});
```

| `event.detail.action` | Default behaviour if not prevented |
| --- | --- |
| `'sign-in'` | Browser follows `signIn.href` |
| `'sign-out'` | Navigates to `signOut.href` if set; otherwise event only |

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
