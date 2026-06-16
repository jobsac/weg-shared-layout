export type LayoutLink = {
  label: string;
  href?: string;
  target?: '_blank' | '_self' | '_parent' | '_top';
  items?: LayoutLink[];
  authAction?: LayoutHeaderAuthAction;
};

export type LayoutHeaderData = {
  logoSrc?: string;
  logoHref?: string;
  menu?: LayoutLink[];
};

export type LayoutHeaderAuthAction = 'sign-in' | 'sign-out';

export type LayoutFooterSocialLink = {
  platform: 'LinkedIn' | 'Instagram' | 'TikTok' | 'YouTube';
  href: string;
};

export type LayoutFooterData = {
  menu?: LayoutLink[][];
  social?: LayoutFooterSocialLink[];
  credits?: string;
  copyright?: string;
};

/**
 * Layout payload accepted by `<weg-header>` and `<weg-footer>`.
 * @see src/assets/dummy-data.json
 */
export type LayoutData = {
  header?: Partial<LayoutHeaderData>;
  footer?: Partial<LayoutFooterData>;
};
