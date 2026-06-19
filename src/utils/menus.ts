import type { LayoutData } from '../types/layout-data';
import type { MenusProps, Weg21BootstrapProps } from '../types/menus-data';
import bootstrapDummy from '../assets/weg21-bootstrap.json';
import menusDummy from '../assets/weg21-menus.json';

export const DEFAULT_WEG21_API_BASE = 'https://warwickemploymentgroup.com/api/v1/weg21';

export const WEG21_BOOTSTRAP_DUMMY = bootstrapDummy as Weg21BootstrapProps;
export const WEG21_MENUS_DUMMY = menusDummy as MenusProps;

export type MenusToLayoutOptions = {
  /** Which header nav slice maps to `header.menu`. Default: `ext` (public marketing nav). */
  headerMenu?: 'ext' | 'int';
};

export function menusToLayoutData(
  bootstrap: Pick<Weg21BootstrapProps, 'footer'>,
  menus: MenusProps,
  options: MenusToLayoutOptions = {},
): LayoutData {
  const headerMenu = options.headerMenu === 'int' ? menus.header.int : menus.header.ext;
  const { credit, copyright, social_links } = bootstrap.footer;

  return {
    header: { menu: headerMenu },
    footer: {
      menu: menus.footer,
      social: social_links,
      credits: credit.trim() || undefined,
      copyright: copyright.trim() || undefined,
    },
  };
}

/** Offline layout from package WEG21 dummy fixtures (`weg21-bootstrap.json` + `weg21-menus.json`). */
export function dummyWeg21LayoutData(options: MenusToLayoutOptions = {}): LayoutData {
  return menusToLayoutData(WEG21_BOOTSTRAP_DUMMY, WEG21_MENUS_DUMMY, options);
}

export type FetchWeg21LayoutOptions = MenusToLayoutOptions & {
  apiBase?: string;
  apiKey?: string;
  fetch?: typeof fetch;
};

export async function fetchWeg21Layout(options: FetchWeg21LayoutOptions = {}): Promise<LayoutData> {
  const apiBase = (options.apiBase ?? DEFAULT_WEG21_API_BASE).replace(/\/$/, '');
  const fetchFn = options.fetch ?? globalThis.fetch;
  const headers: Record<string, string> = { accept: 'application/json' };
  if (options.apiKey) headers['wcms-api-key'] = options.apiKey;

  const [bootstrapRes, menusRes] = await Promise.all([
    fetchFn(apiBase, { headers }),
    fetchFn(`${apiBase}/menus`, { headers }),
  ]);

  if (!bootstrapRes.ok || !menusRes.ok) {
    throw new Error(`WEG21 API error: bootstrap=${bootstrapRes.status} menus=${menusRes.status}`);
  }

  const bootstrap = (await bootstrapRes.json()) as Weg21BootstrapProps;
  const menus = (await menusRes.json()) as MenusProps;

  return menusToLayoutData(bootstrap, menus, options);
}
