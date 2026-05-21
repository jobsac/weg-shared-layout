export type LayoutLink = {
  label: string;
  href: string;
};

export type LayoutHeaderLink = LayoutLink;

export type LayoutHeaderSignOutLink = {
  label: string;
  href?: string;
};

export type LayoutHeaderDropdown = {
  label: string;
  items: LayoutHeaderLink[];
};

export type LayoutHeaderData = {
  logoHref?: string;
  dropdowns?: LayoutHeaderDropdown[];
  links?: LayoutHeaderLink[];
  signIn?: LayoutHeaderLink;
  signOut?: LayoutHeaderSignOutLink;
};

export type LayoutHeaderAuthAction = 'sign-in' | 'sign-out';

export type LayoutFooterLink = LayoutLink;

export type LayoutFooterColumn = {
  links: LayoutFooterLink[];
};

export type LayoutFooterSocialPlatform = 'LinkedIn' | 'Instagram' | 'TikTok' | 'YouTube';

export type LayoutFooterSocialLink = {
  platform: LayoutFooterSocialPlatform;
  href: string;
};

/**
 * Layout payload accepted by `<weg-header>` and `<weg-footer>`.
 * Matches `GET /api/layout` shape from the WEG CMS.
 */
export type LayoutData = {
  header?: Partial<LayoutHeaderData>;
  footer?: Partial<{
    social: unknown;
    columns: unknown;
    credits: unknown;
    copyright: unknown;
  }>;
};
