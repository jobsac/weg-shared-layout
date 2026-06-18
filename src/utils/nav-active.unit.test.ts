import { describe, it, expect } from 'vitest';
import { getNavLinkMatchScore, isNavLinkActive, normalizeNavPath, resolveAriaCurrentNavKey } from './nav-active';

describe('normalizeNavPath', () => {
  it('normalizes trailing slashes and casing', () => {
    expect(normalizeNavPath('/Career-Advice/')).toBe('/career-advice');
    expect(normalizeNavPath('/')).toBe('/');
  });

  it('extracts pathname from absolute URLs', () => {
    expect(normalizeNavPath('https://www.warwickemploymentgroup.com/find-a-job')).toBe('/find-a-job');
  });
});

describe('isNavLinkActive', () => {
  it('matches flat links with prefix mode', () => {
    expect(isNavLinkActive('/career-advice/my-article', '/career-advice', 'prefix')).toBe(true);
    expect(isNavLinkActive('/career-advice', '/career-advice', 'prefix')).toBe(true);
    expect(isNavLinkActive('/career', '/career-advice', 'prefix')).toBe(false);
  });

  it('matches home only on exact path', () => {
    expect(isNavLinkActive('/', '/', 'prefix')).toBe(true);
    expect(isNavLinkActive('/career-advice', '/', 'prefix')).toBe(false);
  });

  it('matches dropdown children with exact mode', () => {
    expect(isNavLinkActive('/search', '/search', 'exact')).toBe(true);
    expect(isNavLinkActive('/search/results', '/search', 'exact')).toBe(false);
  });

  it('matches href query strings exactly', () => {
    expect(
      isNavLinkActive('/search?category=graduates', '/search?category=graduates', 'exact'),
    ).toBe(true);
    expect(isNavLinkActive('/search', '/search?category=graduates', 'exact')).toBe(false);
  });

  it('matches absolute href pathnames against current path', () => {
    expect(
      isNavLinkActive(
        '/find-a-job',
        'https://www.warwickemploymentgroup.com/find-a-job',
        'prefix',
      ),
    ).toBe(true);
    expect(
      isNavLinkActive(
        '/dashboard',
        'https://account.warwickemploymentgroup.com/dashboard',
        'prefix',
      ),
    ).toBe(true);
  });

  it('ignores invalid hrefs', () => {
    expect(isNavLinkActive('/dashboard', '#', 'prefix')).toBe(false);
    expect(isNavLinkActive('/dashboard', undefined, 'prefix')).toBe(false);
  });
});

describe('getNavLinkMatchScore', () => {
  it('prefers more specific matches', () => {
    const current = '/career-advice/my-article';
    const sectionScore = getNavLinkMatchScore(current, '/career-advice', 'prefix');
    const articleScore = getNavLinkMatchScore(current, '/career-advice/my-article', 'exact');
    expect(articleScore).toBeGreaterThan(sectionScore);
  });
});

describe('resolveAriaCurrentNavKey', () => {
  const sampleMenu = [
    {
      label: 'Find a job',
      items: [{ label: 'Graduates', href: '/search?category=graduates' }],
    },
    { label: 'Career advice', href: '/career-advice' },
    { label: 'Sign in', href: '/account/login' },
  ];

  it('selects the most specific active dropdown child', () => {
    expect(resolveAriaCurrentNavKey(sampleMenu, '/search?category=graduates')).toBe(
      '/search?category=graduates',
    );
  });

  it('selects a matching flat link', () => {
    expect(resolveAriaCurrentNavKey(sampleMenu, '/career-advice/my-article')).toBe('/career-advice');
  });
});
