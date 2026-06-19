/**
 * WEG21 API types — mirrors wegcms-v2 `src/weg-shared-layout/menus-types.ts`.
 * @see GET /api/v1/weg21
 * @see GET /api/v1/weg21/menus
 */
export type LayoutPlatform = 'LinkedIn' | 'Instagram' | 'TikTok' | 'YouTube';

export type LayoutSocialLink = {
  platform: LayoutPlatform;
  href: string;
};

export type MenuItemProps = {
  label: string;
  href?: string;
  items?: MenuItemProps[];
};

export type HeaderMenuProps = {
  ext: MenuItemProps[];
  int: MenuItemProps[];
};

export type FooterMenuProps = MenuItemProps[][];

/** `GET /api/v1/weg21/menus` response body. */
export type MenusProps = {
  header: HeaderMenuProps;
  footer: FooterMenuProps;
};

export type Weg21FooterProps = {
  social_links: LayoutSocialLink[];
  credit: string;
  copyright: string;
};

/** `GET /api/v1/weg21` response body. */
export type Weg21BootstrapProps = {
  logo: string;
  favicon: string;
  menus: string;
  footer: Weg21FooterProps;
};
