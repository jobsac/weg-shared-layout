# Publishing to npm

## `npm publish` does not run your build by default

Publishing packs **whatever is already on disk** under the paths listed in [`package.json` `files`](../package.json) (for this package: `dist/`, `loader/`, and `dummy-data.json`). It does **not** automatically run `npm run build` unless a lifecycle script does.

If you publish with an empty, missing, or half-built `dist/`, consumers get a broken tarball (missing `dist/esm/loader.js`, missing `dist/components/*.js`, etc.).

## What this repo does

The **`prepack`** script runs **`npm run build`** before every:

- `npm pack`
- `npm publish` (which packs first)

So the Stencil output and generated `loader/` are always fresh in the tarball.

```json
"scripts": {
  "prepack": "npm run build",
  "build": "stencil build"
}
```

## Release checklist

1. Bump **`version`** in `package.json`.
2. From the package root:

   ```bash
   npm run build
   npm test
   npm pack --dry-run
   ```

   Inspect the dry-run file list and spot-check for `dist/esm/loader.js`, `dist/components/weg-footer.js`, and `loader/index.js`.

3. Publish (runs `prepack` → build again):

   ```bash
   npm publish
   ```

Use `npm publish --dry-run` if you want to exercise the full pack pipeline without uploading.

## CI

If you publish from CI, run **`npm run build`** (or rely on **`npm publish`**, which triggers **`prepack`**) in the same job before `npm publish`, and ensure **devDependencies** (e.g. `@stencil/core`) are installed so `stencil build` succeeds.
