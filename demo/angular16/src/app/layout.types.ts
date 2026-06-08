/**
 * Production pattern: import fixture/types from the installed package.
 * Requires `resolveJsonModule` + `moduleResolution` `bundler` (or `node16`) in tsconfig.
 * @see ../../docs/angular.md
 */
import layoutFixture from 'weg-shared-layout/dummy-data.json';

/** Aligns with weg-shared-layout / CMS layout shape */
export type LayoutData = typeof layoutFixture;
