import { render, h, describe, it, expect } from '@stencil/vitest';
import { runAxe } from '../../../test-utils/axe';
import { FULL_LAYOUT_FIXTURE, SAMPLE_FOOTER_LAYOUT } from '../../../test-utils/layout-fixtures';

describe('weg-footer', () => {
  it('renders safely when layout is undefined', async () => {
    const { root } = await render(<weg-footer></weg-footer>);
    expect(root).toBeTruthy();
    expect(root.shadowRoot?.querySelector('.footer')).toBeTruthy();
  });

  it('renders social links, menu, and legal text from layout object', async () => {
    const { root } = await render(<weg-footer layout={SAMPLE_FOOTER_LAYOUT}></weg-footer>);
    const text = root.shadowRoot?.textContent ?? '';
    expect(text).toContain('Find a job');
    expect(text).toContain('About WEG');
    expect(text).toContain('Example credits text.');
    expect(text).toContain('Copyright © Example.');
  });

  it('parses JSON string layout prop', async () => {
    const { root } = await render(<weg-footer layout={JSON.stringify(SAMPLE_FOOTER_LAYOUT)}></weg-footer>);
    const text = root.shadowRoot?.textContent ?? '';
    expect(text).toContain('Find a job');
    expect(text).toContain('Copyright © Example.');
  });

  describe('accessibility', () => {
    it('has no WCAG violations with sample layout', async () => {
      const { root } = await render(<weg-footer layout={SAMPLE_FOOTER_LAYOUT}></weg-footer>);
      const results = await runAxe(root);
      expect(results.violations).toEqual([]);
    });

    it('has no WCAG violations with full layout fixture', async () => {
      const { root } = await render(<weg-footer layout={FULL_LAYOUT_FIXTURE}></weg-footer>);
      const results = await runAxe(root);
      expect(results.violations).toEqual([]);
    });

    it('has no WCAG violations when layout is undefined', async () => {
      const { root } = await render(<weg-footer></weg-footer>);
      const results = await runAxe(root);
      expect(results.violations).toEqual([]);
    });
  });
});
