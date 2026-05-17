# Plain HTML / vanilla JS

With a bundler that resolves `node_modules` imports:

```html
<weg-footer id="footer"></weg-footer>
<script type="module">
  import { defineCustomElements } from 'weg-shared-layout/loader';
  import layout from 'weg-shared-layout/dummy-data.json';

  defineCustomElements();
  document.getElementById('footer').layout = layout;
</script>
```

Otherwise, copy `dummy-data.json` to your static assets, `fetch` it, parse JSON, then assign **`element.layout`**.

You can also pass a JSON string on the **`layout` attribute**; the component parses it the same way as an object `layout` property.
