import { render, h, describe, it, expect } from '@stencil/vitest';
import { runAxe } from '../../../test-utils/axe';
import DUMMY_LAYOUT from '../../assets/dummy-data.json';

const SAMPLE_FOOTER_LAYOUT = {
  footer: {
    social: [{ platform: 'LinkedIn', href: 'https://www.linkedin.com/company/example/' }],
    menu: [
      [
        { label: 'Find a job', href: '/jobs' },
        { label: 'About WEG', href: '/about' },
      ],
    ],
    credits: 'Example credits text.',
    copyright: 'Copyright © Example.',
  },
};

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

    it('has no WCAG violations with full dummy layout', async () => {
      const { root } = await render(<weg-footer layout={DUMMY_LAYOUT}></weg-footer>);
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
