import type { LayoutLink } from '../types/layout-data';

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

export function normalizeLinks(input: unknown): LayoutLink[] {
  if (!Array.isArray(input)) return [];
  const result: LayoutLink[] = [];
  for (const item of input) {
    if (!item || typeof item !== 'object') continue;
    const label = (item as { label?: unknown }).label;
    const href = (item as { href?: unknown }).href;
    if (!isNonEmptyString(label)) continue;
    if (!isNonEmptyString(href)) continue;
    result.push({ label: label.trim(), href: href.trim() });
  }
  return result;
}

export function normalizeMenu(input: unknown): LayoutLink[][] {
  if (!Array.isArray(input)) return [];
  const result: LayoutLink[][] = [];
  for (const column of input) {
    const links = normalizeLinks(column);
    if (links.length === 0) continue;
    result.push(links);
  }
  return result;
}

export function normalizeHeaderMenu(input: unknown): LayoutLink[] {
  if (!Array.isArray(input)) return [];
  const result: LayoutLink[] = [];
  for (const item of input) {
    if (!item || typeof item !== 'object') continue;
    const label = (item as { label?: unknown }).label;
    const items = normalizeLinks((item as { items?: unknown }).items);
    if (!isNonEmptyString(label)) continue;
    if (items.length === 0) continue;
    result.push({ label: label.trim(), items });
  }
  return result;
}
