import {
  ACCOUNT_DASHBOARD_HREF,
  ACCOUNT_MANAGE_HREF,
  DEFAULT_LOGO_HREF,
  FIND_A_JOB_HREF,
  HEADER_SIGN_OUT,
} from '../../constants/weg-urls';

export { DEFAULT_LOGO_HREF } from '../../constants/weg-urls';

export const SIGNED_IN_HEADER = {
  logoHref: DEFAULT_LOGO_HREF,
  links: [
    { label: 'Find a job', href: FIND_A_JOB_HREF },
    { label: 'Dashboard', href: ACCOUNT_DASHBOARD_HREF },
  ],
  manageAccount: {
    href: ACCOUNT_MANAGE_HREF,
  },
  signOut: HEADER_SIGN_OUT,
} as const;
