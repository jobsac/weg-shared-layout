import { Config } from '@stencil/core';
import { postcss } from '@stencil-community/postcss';
import postcssGlobalData from '@csstools/postcss-global-data';
import postcssCustomMedia from 'postcss-custom-media';
import { join } from 'path';

const breakpointsPath = join(__dirname, 'src/styles/breakpoints.css');

export const config: Config = {
  namespace: 'weg-shared-layout',
  plugins: [
    postcss({
      plugins: [
        postcssGlobalData({
          files: [breakpointsPath],
        }),
        postcssCustomMedia(),
      ],
    }),
  ],
  outputTargets: [
    {
      type: 'dist',
      esmLoaderPath: '../loader',
    },
    {
      type: 'dist-hydrate-script',
    },
    {
      type: 'dist-custom-elements',
      customElementsExportBehavior: 'auto-define-custom-elements',
      externalRuntime: false,
      generateTypeDeclarations: true,
    },
    {
      type: 'docs-readme',
    },
    {
      type: 'www',
      serviceWorker: null, // disable service workers
    },
  ],
};
