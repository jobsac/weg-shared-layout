import { describe, it, expect } from 'vitest';
import { parseJsonProp, isNonEmptyString, normalizeLinks } from './layout';

describe('parseJsonProp', () => {
  it('returns non-string values unchanged', () => {
    expect(parseJsonProp({ header: {} })).toEqual({ header: {} });
  });

  it('parses JSON strings', () => {
    expect(parseJsonProp('{"footer":{}}')).toEqual({ footer: {} });
  });

  it('returns undefined for invalid or empty strings', () => {
    expect(parseJsonProp('')).toBeUndefined();
    expect(parseJsonProp('not json')).toBeUndefined();
  });
});

describe('isNonEmptyString', () => {
  it('accepts trimmed non-empty strings', () => {
    expect(isNonEmptyString(' hello ')).toBe(true);
  });

  it('rejects empty or non-string values', () => {
    expect(isNonEmptyString('   ')).toBe(false);
    expect(isNonEmptyString(null)).toBe(false);
  });
});

describe('normalizeLinks', () => {
  it('filters invalid entries and trims valid links', () => {
    expect(
      normalizeLinks([
        { label: ' About ', href: ' /about ' },
        { label: '', href: '/x' },
        { label: 'Missing href' },
        null,
      ]),
    ).toEqual([{ label: 'About', href: '/about' }]);
  });

  it('returns an empty array for non-arrays', () => {
    expect(normalizeLinks(undefined)).toEqual([]);
  });
});
