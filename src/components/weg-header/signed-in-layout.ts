export const DEFAULT_LOGO_HREF = 'https://www.warwickemploymentgroup.com/';

export const SIGNED_IN_HEADER = {
  logoHref: DEFAULT_LOGO_HREF,
  links: [
    { label: 'Find a job', href: 'https://www.warwickemploymentgroup.com/find-a-job' },
    { label: 'Dashboard', href: 'https://account.warwickemploymentgroup.com/dashboard' },
  ],
  manageAccount: {
    href: 'https://account.warwickemploymentgroup.com/account/manage',
  },
  signOut: {
    label: 'Sign out',
    href: 'https://account.warwickemploymentgroup.com/account/login',
  },
} as const;
