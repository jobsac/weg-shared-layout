import type { LayoutLink } from '../types/layout-data';

const LINK_TARGETS = new Set(['_blank', '_self', '_parent', '_top']);

export function parseJsonProp(value: unknown): unknown {
  if (typeof value !== 'string') return value;
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  try {
    return JSON.parse(trimmed) as unknown;
  } catch {
    return undefined;
  }
}

export function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

export function isMenuGroup(link: LayoutLink): boolean {
  return Boolean(link.items?.length);
}

function readNestedItems(raw: Record<string, unknown>): unknown {
  return raw.items ?? raw.children;
}

function readLinkTarget(raw: Record<string, unknown>): LayoutLink['target'] | undefined {
  const target = raw.target;
  if (typeof target === 'string' && LINK_TARGETS.has(target)) {
    return target as LayoutLink['target'];
  }
  return undefined;
}

export function normalizeLayoutLink(
  input: unknown,
  options?: { requireHref?: boolean },
): LayoutLink | null {
  if (!input || typeof input !== 'object') return null;
  const raw = input as Record<string, unknown>;
  const label = raw.label;
  if (!isNonEmptyString(label)) return null;

  const nested = readNestedItems(raw);
  if (Array.isArray(nested)) {
    const items = normalizeLinks(nested, { requireHref: true });
    if (items.length > 0) {
      return { label: label.trim(), items };
    }
  }

  const href = raw.href;
  if (isNonEmptyString(href)) {
    const link: LayoutLink = { label: label.trim(), href: href.trim() };
    const target = readLinkTarget(raw);
    if (target) link.target = target;
    return link;
  }

  return options?.requireHref === false ? null : null;
}

export function normalizeLinks(
  input: unknown,
  options?: { requireHref?: boolean },
): LayoutLink[] {
  if (!Array.isArray(input)) return [];
  const requireHref = options?.requireHref ?? true;
  const result: LayoutLink[] = [];
  for (const item of input) {
    const link = normalizeLayoutLink(item, { requireHref });
    if (link) result.push(link);
  }
  return result;
}

export function normalizeHeaderMenu(input: unknown): LayoutLink[] {
  return normalizeLinks(input, { requireHref: false });
}

export function normalizeMenu(input: unknown): LayoutLink[][] {
  if (!Array.isArray(input)) return [];
  const result: LayoutLink[][] = [];
  for (const column of input) {
    const links = normalizeLinks(column, { requireHref: true });
    if (links.length === 0) continue;
    result.push(links);
  }
  return result;
}
