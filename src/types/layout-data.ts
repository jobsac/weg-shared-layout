export type LayoutFooterLink = {
  label: string;
  href: string;
};

export type LayoutFooterColumn = {
  links: LayoutFooterLink[];
};

export type LayoutFooterSocialPlatform = 'LinkedIn' | 'Instagram' | 'TikTok' | 'YouTube';

export type LayoutFooterSocialLink = {
  platform: LayoutFooterSocialPlatform;
  href: string;
};

/**
 * Layout payload accepted by `<weg-footer layout={...}>`.
 * Matches `GET /api/layout` footer shape from the WEG CMS.
 */
export type LayoutData = {
  header?: unknown;
  footer?: Partial<{
    social: unknown;
    columns: unknown;
    credits: unknown;
    copyright: unknown;
  }>;
};
