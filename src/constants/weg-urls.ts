/** Canonical WEG site and account URLs — single source of truth for components, docs, and host apps. */

export const WEG_SITE_ORIGIN = 'https://www.warwickemploymentgroup.com';
export const ACCOUNT_ORIGIN = 'https://account.warwickemploymentgroup.com';

export const DEFAULT_LOGO_HREF = `${WEG_SITE_ORIGIN}/`;
export const FIND_A_JOB_HREF = `${WEG_SITE_ORIGIN}/find-a-job`;
export const CAREER_ADVICE_HREF = `${WEG_SITE_ORIGIN}/career-advice`;

export const ACCOUNT_LOGIN_HREF = `${ACCOUNT_ORIGIN}/account/login`;
export const ACCOUNT_REGISTER_HREF = `${ACCOUNT_ORIGIN}/account/register`;
export const ACCOUNT_DASHBOARD_HREF = `${ACCOUNT_ORIGIN}/dashboard`;
export const ACCOUNT_MANAGE_HREF = `${ACCOUNT_ORIGIN}/account/manage`;

export const HEADER_SIGN_IN = {
  label: 'Sign in',
  href: ACCOUNT_LOGIN_HREF,
} as const;

export const HEADER_SIGN_OUT = {
  label: 'Sign out',
  href: ACCOUNT_LOGIN_HREF,
} as const;
