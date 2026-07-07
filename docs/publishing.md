# Publishing to npm

## `npm publish` does not run your build by default

Publishing packs **whatever is already on disk** under the paths listed in [`package.json` `files`](../package.json) (for this package that includes `dist/`, `hydrate/`, `docs/`, `loader/`, JSON fixtures, and exported source/type files). It does **not** automatically run `npm run build` unless a lifecycle script does.

If you publish with an empty, missing, or half-built `dist/`, consumers get a broken tarball (missing `loader/index.js`, missing `dist/components/*.js`, missing type declarations, etc.).

## What this repo does

The **`prepack`** script runs **`pnpm run build`** before every:

- `npm pack`
- `npm publish` (which packs first)

So the Stencil output and generated `loader/` are always fresh in the tarball.

```json
"scripts": {
  "prepack": "pnpm run build",
  "build": "stencil build"
}
```

## Release checklist

1. Bump **`version`** in `package.json`.
2. From the package root:

   ```bash
   pnpm run build
   pnpm test
   npm pack --dry-run
   ```

   Inspect the dry-run file list and spot-check for:

   - `loader/index.js`, `loader/index.d.ts`
   - `dist/components/weg-header.js`, `dist/components/weg-footer.js`
   - `src/assets/weg21-bootstrap.json`, `src/assets/weg21-menus.json` (via package `exports`)
   - `dist/types/types/layout-data.d.ts` (via `exports["./layout-data"]`)

3. Smoke-test the Angular 16 demo (optional but recommended):

   ```bash
   pnpm run demo:angular16:build
   ```

   See [demo/angular16/README.md](../demo/angular16/README.md).

4. Publish (runs `prepack` → build again):

   ```bash
   npm publish
   ```

Use `npm publish --dry-run` if you want to exercise the full pack pipeline without uploading.

## What consumers import

Documented in [docs/README.md](./README.md): `loader`, `menus`, `menus-data`, `layout-data`, `weg21-bootstrap.json`, `weg21-menus.json`, `hydrate`, and per-tag subpaths. Angular 16 apps need modern `moduleResolution` or the loader-only pattern — [angular.md](./angular.md).

## CI

If you publish from CI, run **`pnpm run build`** (or rely on **`npm publish`**, which triggers **`prepack`**) in the same job before `npm publish`, and ensure **devDependencies** (e.g. `@stencil/core`) are installed so `stencil build` succeeds.
