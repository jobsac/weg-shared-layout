export type NavActiveMode = 'exact' | 'prefix';

export function normalizeNavPath(path: string): string {
  if (!path?.trim()) return '/';

  let value = path.trim().toLowerCase().split('#')[0];

  if (value.startsWith('http://') || value.startsWith('https://')) {
    try {
      value = new URL(value).pathname;
    } catch {
      return '/';
    }
  }

  if (!value.startsWith('/')) {
    value = `/${value}`;
  }

  if (value.length > 1 && value.endsWith('/')) {
    value = value.slice(0, -1);
  }

  return value || '/';
}

export function parseCurrentLocation(currentPath: string): { pathname: string; search: string } {
  const trimmed = currentPath.trim();
  const queryIndex = trimmed.indexOf('?');
  const pathPart = queryIndex === -1 ? trimmed : trimmed.slice(0, queryIndex);
  const queryPart = queryIndex === -1 ? '' : trimmed.slice(queryIndex + 1).split('#')[0];

  return {
    pathname: normalizeNavPath(pathPart),
    search: queryPart ? `?${queryPart.toLowerCase()}` : '',
  };
}

export function parseNavHref(href: string): { pathname: string; search: string } | null {
  const trimmed = href.trim();
  if (!trimmed || trimmed === '#') return null;

  try {
    const url = trimmed.startsWith('http://') || trimmed.startsWith('https://')
      ? new URL(trimmed)
      : new URL(trimmed, 'http://local');

    return {
      pathname: normalizeNavPath(url.pathname),
      search: url.search.toLowerCase(),
    };
  } catch {
    return null;
  }
}

export function isNavLinkActive(
  currentPath: string,
  href: string | undefined,
  mode: NavActiveMode = 'prefix',
): boolean {
  if (!currentPath?.trim() || !href?.trim()) return false;

  const parsedHref = parseNavHref(href);
  if (!parsedHref) return false;

  const current = parseCurrentLocation(currentPath);

  if (parsedHref.search) {
    return current.pathname === parsedHref.pathname && current.search === parsedHref.search;
  }

  if (parsedHref.pathname === '/' || mode === 'exact') {
    return current.pathname === parsedHref.pathname;
  }

  if (current.pathname === parsedHref.pathname) return true;

  return current.pathname.startsWith(`${parsedHref.pathname}/`);
}

export function getNavLinkMatchScore(
  currentPath: string,
  href: string | undefined,
  mode: NavActiveMode = 'prefix',
): number {
  if (!isNavLinkActive(currentPath, href, mode)) return 0;

  const parsedHref = parseNavHref(href!);
  if (!parsedHref) return 0;

  let score = parsedHref.pathname.length;
  if (parsedHref.search) score += 100;
  if (mode === 'exact') score += 50;

  return score;
}

export function getNavHrefKey(href: string | undefined): string | null {
  if (!href?.trim()) return null;

  const parsed = parseNavHref(href);
  if (!parsed) return null;

  return `${parsed.pathname}${parsed.search}`;
}

export type NavMenuItem = {
  label?: string;
  href?: string;
  items?: NavMenuItem[];
};

export function resolveAriaCurrentNavKey(
  menu: NavMenuItem[],
  currentPath: string,
  shouldExclude?: (item: NavMenuItem) => boolean,
): string | null {
  const trimmedPath = currentPath.trim();
  if (!trimmedPath) return null;

  let bestKey: string | null = null;
  let bestScore = 0;

  for (const item of menu) {
    if (item.items?.length) {
      for (const child of item.items) {
        if (!child.href || shouldExclude?.(child)) continue;

        const score = getNavLinkMatchScore(trimmedPath, child.href, 'exact');
        const key = getNavHrefKey(child.href);
        if (key && score > bestScore) {
          bestScore = score;
          bestKey = key;
        }
      }
      continue;
    }

    if (!item.href || shouldExclude?.(item)) continue;

    const score = getNavLinkMatchScore(trimmedPath, item.href, 'prefix');
    const key = getNavHrefKey(item.href);
    if (key && score > bestScore) {
      bestScore = score;
      bestKey = key;
    }
  }

  return bestKey;
}

export function isAriaCurrentNavHref(href: string | undefined, ariaCurrentKey: string | null): boolean {
  if (!ariaCurrentKey) return false;
  return getNavHrefKey(href) === ariaCurrentKey;
}
