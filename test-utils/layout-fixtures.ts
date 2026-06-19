import type { LayoutData } from '../src/types/layout-data';

/** Minimal layout for component tests and local fallback. */
export const SAMPLE_HEADER_LAYOUT: LayoutData = {
  header: {
    menu: [
      {
        label: 'Find a job',
        items: [{ label: 'Graduates', href: '/search?category=graduates' }],
      },
      { label: 'Career advice', href: '/career-advice' },
      { label: 'Sign in', href: '/account/login' },
    ],
  },
};

/** Header with three dropdown groups (desktop nav interaction tests). */
export const MULTI_DROPDOWN_HEADER_LAYOUT: LayoutData = {
  header: {
    menu: [
      {
        label: 'Find a job',
        items: [
          { label: 'Graduates', href: '/graduates' },
          { label: 'Senior roles', href: '/senior' },
        ],
      },
      { label: 'Hire talent', items: [{ label: 'Executive search', href: '/executive' }] },
      { label: 'HE solutions', items: [{ label: 'Franchise', href: '/franchise' }] },
      { label: 'Sign in', href: '/account/login' },
    ],
  },
};

export const SAMPLE_FOOTER_LAYOUT: LayoutData = {
  footer: {
    social: [{ platform: 'LinkedIn', href: 'https://www.linkedin.com/company/example/' }],
    menu: [
      [
        { label: 'Find a job', href: '/jobs' },
        { label: 'About WEG', href: '/about' },
      ],
    ],
    credits: 'Example credits text.',
    copyright: 'Copyright © Example.',
  },
};

/** Combined layout for accessibility tests. */
export const FULL_LAYOUT_FIXTURE: LayoutData = {
  header: MULTI_DROPDOWN_HEADER_LAYOUT.header,
  footer: SAMPLE_FOOTER_LAYOUT.footer,
};
