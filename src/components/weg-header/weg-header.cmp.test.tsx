import { render, h, describe, it, expect } from '@stencil/vitest';
import { userEvent } from 'vitest/browser';
import { runAxe } from '../../../test-utils/axe';
import { DESKTOP_VIEWPORT, MOBILE_VIEWPORT, setViewport, waitForUpdate } from '../../../test-utils/viewport';
import DUMMY_LAYOUT from '../../assets/dummy-data.json';

const SAMPLE_HEADER_LAYOUT = {
  header: {
    menu: [
      {
        label: 'Find a job',
        items: [{ label: 'Graduates', href: '/search?category=graduates' }],
      },
      { label: 'Career advice', href: '/career-advice' },
      { label: 'Sign in', href: '/account/login' },
    ],
  },
};

describe('weg-header', () => {
  it('renders safely when layout is undefined', async () => {
    const { root } = await render(<weg-header></weg-header>);
    expect(root).toBeTruthy();
    const header = root.shadowRoot?.querySelector('.header');
    expect(header).toBeTruthy();
  });

  it('uses header.logoHref when provided', async () => {
    const { root } = await render(
      <weg-header
        layout={{
          header: {
            logoHref: 'https://example.com/custom-home',
            menu: [],
          },
        }}
      ></weg-header>,
    );
    const logoLink = root.shadowRoot?.querySelector('.logo-link') as HTMLAnchorElement | null;
    expect(logoLink?.href).toBe('https://example.com/custom-home');
  });

  it('parses JSON string layout prop', async () => {
    const { root } = await render(<weg-header layout={JSON.stringify(SAMPLE_HEADER_LAYOUT)}></weg-header>);
    const text = root.shadowRoot?.textContent ?? '';
    expect(text).toContain('Find a job');
    expect(text).toContain('Career advice');
    expect(text).toContain('Sign in');
  });

  it('renders dropdown labels and flat links from layout object', async () => {
    const { root } = await render(<weg-header layout={SAMPLE_HEADER_LAYOUT}></weg-header>);
    const text = root.shadowRoot?.textContent ?? '';
    expect(text).toContain('Find a job');
    expect(text).toContain('Career advice');
  });

  it('shows signed-in navigation when signed-in is true', async () => {
    const { root } = await render(
      <weg-header layout={SAMPLE_HEADER_LAYOUT} signed-in user-name="Alex"></weg-header>,
    );
    const text = root.shadowRoot?.textContent ?? '';
    expect(text).toContain('Find a job');
    expect(text).toContain('Dashboard');
    expect(text).toContain('Alex');
    expect(text).toContain('Sign out');
    expect(text).not.toContain('Sign in');
    expect(text).not.toContain('Career advice');
    expect(root.shadowRoot?.querySelector('.find-a-job-link svg')).toBeTruthy();
    expect(root.shadowRoot?.querySelector('.dashboard-link svg')).toBeTruthy();
  });

  it('emits wegAuthClick when auth control is clicked', async () => {
    const { root } = await render(<weg-header layout={SAMPLE_HEADER_LAYOUT}></weg-header>);
    let detail: { action: string } | undefined;
    root.addEventListener('wegAuthClick', ((event: CustomEvent<{ action: string }>) => {
      detail = event.detail;
      event.preventDefault();
    }) as EventListener);

    const authLink = root.shadowRoot?.querySelector('.main-nav .sign-in-link') as HTMLAnchorElement | null;
    expect(authLink).toBeTruthy();
    authLink?.click();

    expect(detail).toEqual({ action: 'sign-in' });
  });

  it('emits sign-out action when signed in', async () => {
    const { root } = await render(<weg-header layout={SAMPLE_HEADER_LAYOUT} signed-in></weg-header>);
    let detail: { action: string } | undefined;
    root.addEventListener('wegAuthClick', ((event: CustomEvent<{ action: string }>) => {
      detail = event.detail;
      event.preventDefault();
    }) as EventListener);

    const signOutLink = root.shadowRoot?.querySelector('.main-nav .sign-out-link') as HTMLAnchorElement | null;
    expect(signOutLink).toBeTruthy();
    expect(signOutLink?.classList.contains('sign-in-link')).toBe(false);
    signOutLink?.click();

    expect(detail).toEqual({ action: 'sign-out' });
  });

  it('opens desktop dropdown on trigger click', async () => {
    await setViewport(DESKTOP_VIEWPORT.width, DESKTOP_VIEWPORT.height);
    const { root } = await render(<weg-header layout={DUMMY_LAYOUT}></weg-header>);

    const triggers = root.shadowRoot?.querySelectorAll(
      '.nav-dropdown__trigger',
    ) as NodeListOf<HTMLButtonElement> | undefined;
    expect(triggers?.length).toBe(3);

    const trigger = triggers?.[0] ?? null;
    expect(trigger?.getAttribute('aria-expanded')).toBe('false');
    await userEvent.click(trigger!);
    await waitForUpdate();

    expect(trigger?.getAttribute('aria-expanded')).toBe('true');
    expect(root.shadowRoot?.querySelector('.nav-dropdown__panel')).toBeTruthy();
  });

  it('opens desktop dropdown on ArrowDown with accessible wiring', async () => {
    await setViewport(DESKTOP_VIEWPORT.width, DESKTOP_VIEWPORT.height);
    const { root } = await render(<weg-header layout={SAMPLE_HEADER_LAYOUT}></weg-header>);

    const trigger = root.shadowRoot?.querySelector('.nav-dropdown__trigger') as HTMLButtonElement | null;
    expect(trigger).toBeTruthy();
    expect(trigger?.getAttribute('aria-haspopup')).toBe('true');
    expect(trigger?.getAttribute('aria-expanded')).toBe('false');
    expect(trigger?.getAttribute('aria-controls')).toBeTruthy();

    trigger?.focus();
    trigger?.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    await waitForUpdate();

    expect(trigger?.getAttribute('aria-expanded')).toBe('true');
    expect(root.shadowRoot?.querySelector('.nav-dropdown__panel')).toBeTruthy();
  });

  it('opens mobile accordion on first tap', async () => {
    await setViewport(MOBILE_VIEWPORT.width, MOBILE_VIEWPORT.height);
    const { root } = await render(<weg-header layout={SAMPLE_HEADER_LAYOUT}></weg-header>);

    const openButton = root.shadowRoot?.querySelector('.menu-toggle') as HTMLButtonElement | null;
    await userEvent.click(openButton!);
    await waitForUpdate();

    const accordionButton = root.shadowRoot?.querySelector(
      'button.nav-dropdown__trigger',
    ) as HTMLButtonElement | null;
    expect(accordionButton?.getAttribute('aria-expanded')).toBe('false');
    await userEvent.click(accordionButton!);
    await waitForUpdate();
    expect(accordionButton?.getAttribute('aria-expanded')).toBe('true');
  });

  it('closes mobile menu when viewport expands to desktop', async () => {
    await setViewport(MOBILE_VIEWPORT.width, MOBILE_VIEWPORT.height);
    const { root } = await render(<weg-header layout={SAMPLE_HEADER_LAYOUT}></weg-header>);

    const openButton = root.shadowRoot?.querySelector('.menu-toggle') as HTMLButtonElement | null;
    await userEvent.click(openButton!);
    await waitForUpdate();
    expect(root.shadowRoot?.querySelector('.header--menu-open')).toBeTruthy();

    await setViewport(DESKTOP_VIEWPORT.width, DESKTOP_VIEWPORT.height);
    await waitForUpdate();
    await new Promise((resolve) => setTimeout(resolve, 50));

    expect(root.shadowRoot?.querySelector('.header--menu-open')).toBeFalsy();
    expect(openButton?.getAttribute('aria-expanded')).toBe('false');
  });

  it('toggles mobile accordion aria-expanded', async () => {
    await setViewport(MOBILE_VIEWPORT.width, MOBILE_VIEWPORT.height);
    const { root } = await render(<weg-header layout={SAMPLE_HEADER_LAYOUT}></weg-header>);

    const openButton = root.shadowRoot?.querySelector('.menu-toggle') as HTMLButtonElement | null;
    expect(openButton).toBeTruthy();
    await userEvent.click(openButton!);
    await waitForUpdate();

    const accordionButton = root.shadowRoot?.querySelector(
      'button.nav-dropdown__trigger',
    ) as HTMLButtonElement | null;
    expect(accordionButton).toBeTruthy();
    expect(accordionButton?.getAttribute('aria-expanded')).toBe('false');
    await userEvent.click(accordionButton!);
    await waitForUpdate();
    expect(accordionButton?.getAttribute('aria-expanded')).toBe('true');
  });

  describe('accessibility', () => {
    it('has no WCAG violations when signed out', async () => {
      const { root } = await render(<weg-header layout={SAMPLE_HEADER_LAYOUT}></weg-header>);
      const results = await runAxe(root);
      expect(results.violations).toEqual([]);
    });

    it('has no WCAG violations when signed in', async () => {
      const { root } = await render(
        <weg-header layout={SAMPLE_HEADER_LAYOUT} signed-in user-name="Alex"></weg-header>,
      );
      const results = await runAxe(root);
      expect(results.violations).toEqual([]);
    });

    it('has no WCAG violations with full dummy layout', async () => {
      const { root } = await render(<weg-header layout={DUMMY_LAYOUT}></weg-header>);
      const results = await runAxe(root);
      expect(results.violations).toEqual([]);
    });

    it('has no WCAG violations when layout is undefined', async () => {
      const { root } = await render(<weg-header></weg-header>);
      const results = await runAxe(root);
      expect(results.violations).toEqual([]);
    });

    it('has no WCAG violations with desktop dropdown open', async () => {
      await setViewport(DESKTOP_VIEWPORT.width, DESKTOP_VIEWPORT.height);
      const { root } = await render(<weg-header layout={SAMPLE_HEADER_LAYOUT}></weg-header>);
      const trigger = root.shadowRoot?.querySelector('.nav-dropdown__trigger') as HTMLButtonElement | null;
      await userEvent.click(trigger!);
      await waitForUpdate();
      const results = await runAxe(root);
      expect(results.violations).toEqual([]);
    });

    it('has no WCAG violations with mobile menu open', async () => {
      await setViewport(MOBILE_VIEWPORT.width, MOBILE_VIEWPORT.height);
      const { root } = await render(<weg-header layout={SAMPLE_HEADER_LAYOUT}></weg-header>);
      const openButton = root.shadowRoot?.querySelector('.menu-toggle') as HTMLButtonElement | null;
      await userEvent.click(openButton!);
      await waitForUpdate();
      const results = await runAxe(root);
      expect(results.violations).toEqual([]);
    });

    it('has no WCAG violations with mobile accordion expanded', async () => {
      await setViewport(MOBILE_VIEWPORT.width, MOBILE_VIEWPORT.height);
      const { root } = await render(<weg-header layout={SAMPLE_HEADER_LAYOUT}></weg-header>);
      const openButton = root.shadowRoot?.querySelector('.menu-toggle') as HTMLButtonElement | null;
      await userEvent.click(openButton!);
      await waitForUpdate();

      const accordionButton = root.shadowRoot?.querySelector(
        'button.nav-dropdown__trigger',
      ) as HTMLButtonElement | null;
      await userEvent.click(accordionButton!);
      await waitForUpdate();
      const results = await runAxe(root);
      expect(results.violations).toEqual([]);
    });
  });
});
