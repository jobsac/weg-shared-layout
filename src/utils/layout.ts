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
