/**
 * Production pattern: import fixture/types from the installed package.
 * Requires `resolveJsonModule` + `moduleResolution` `bundler` (or `node16`) in tsconfig.
 * @see ../README.md — "Replicating in your own Angular 16 app"
 */
import layoutFixture from 'weg-shared-layout/dummy-data.json';

/** Aligns with weg-shared-layout / CMS layout shape */
export type LayoutData = typeof layoutFixture;
