import { render, h, describe, it, expect, vi, beforeEach } from '@stencil/vitest';
import { userEvent } from 'vitest/browser';
import { runAxe } from '../../../test-utils/axe';
import { setViewport, waitForUpdate, DESKTOP_VIEWPORT, MOBILE_VIEWPORT } from '../../../test-utils/viewport';
import {
  FULL_LAYOUT_FIXTURE,
  MULTI_DROPDOWN_HEADER_LAYOUT,
  SAMPLE_HEADER_LAYOUT,
} from '../../../test-utils/layout-fixtures';

describe('weg-header', () => {
  it('renders safely when layout is undefined', async () => {
    const { root } = await render(<weg-header></weg-header>);
    expect(root).toBeTruthy();
    const header = root.shadowRoot?.querySelector('.header');
    expect(header).toBeTruthy();
    const skipLink = root.shadowRoot?.querySelector('.skip-to-content') as HTMLAnchorElement | null;
    expect(skipLink?.getAttribute('href')).toBe('#');
    expect(skipLink?.textContent).toBe('Skip to main content');
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

  it('falls back to built-in signed-in navigation when signed-in and layout menu is empty', async () => {
    const { root } = await render(
      <weg-header layout={{ header: { menu: [] } }} signed-in user-name="Alex"></weg-header>,
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

  it('uses layout.header.menu when signed-in and menu is provided', async () => {
    const accountBase = 'https://dev-account.warwickemploymentgroup.com';
    const signedInLayout = {
      header: {
        menu: [
          { label: 'Find a job', href: '/find-a-job' },
          { label: 'Dashboard', href: `${accountBase}/dashboard` },
          { label: 'Manage Account', href: `${accountBase}/account/manage` },
          { label: 'Sign out', href: '#' },
        ],
      },
    };

    const { root } = await render(
      <weg-header
        layout={signedInLayout}
        account-base-url={accountBase}
        signed-in
        user-name="Alex"
      ></weg-header>,
    );

    const findJobLink = root.shadowRoot?.querySelector('.find-a-job-link') as HTMLAnchorElement | null;
    const dashboardLink = root.shadowRoot?.querySelector('.dashboard-link') as HTMLAnchorElement | null;
    const manageLink = root.shadowRoot?.querySelector('.manage-account-link') as HTMLAnchorElement | null;

    expect(findJobLink?.pathname).toBe('/find-a-job');
    expect(findJobLink?.querySelector('svg')).toBeTruthy();
    expect(dashboardLink?.href).toBe(`${accountBase}/dashboard`);
    expect(dashboardLink?.querySelector('svg')).toBeTruthy();
    expect(manageLink?.href).toBe(`${accountBase}/account/manage`);
    expect(root.shadowRoot?.textContent).not.toContain('Career advice');
  });

  it('uses layout menu href for Manage Account when provided, without account-base-url', async () => {
    const accountBase = 'https://dev-account.warwickemploymentgroup.com';
    const signedInLayout = {
      header: {
        menu: [
          { label: 'Dashboard', href: `${accountBase}/dashboard` },
          { label: 'Manage Account', href: `${accountBase}/account/manage` },
          { label: 'Sign out', href: '#' },
        ],
      },
    };

    const { root } = await render(
      <weg-header layout={signedInLayout} signed-in user-name="Alex"></weg-header>,
    );

    const manageLink = root.shadowRoot?.querySelector('.manage-account-link') as HTMLAnchorElement | null;
    expect(manageLink?.href).toBe(`${accountBase}/account/manage`);
  });

  it('uses account-base-url for built-in signed-in navigation links', async () => {
    const accountBase = 'https://dev-account.warwickemploymentgroup.com';
    const { root } = await render(
      <weg-header
        layout={{ header: { menu: [] } }}
        account-base-url={accountBase}
        signed-in
        user-name="Alex"
      ></weg-header>,
    );

    const dashboardLink = root.shadowRoot?.querySelector('.dashboard-link') as HTMLAnchorElement | null;
    const manageLink = root.shadowRoot?.querySelector('.manage-account-link') as HTMLAnchorElement | null;
    const signOutLink = root.shadowRoot?.querySelector('.sign-out-link') as HTMLAnchorElement | null;

    expect(dashboardLink?.href).toBe(`${accountBase}/dashboard`);
    expect(manageLink?.href).toBe(`${accountBase}/account/manage`);
    expect(signOutLink?.getAttribute('href')).toBe('#');
  });

  it('applies active styles from current-path', async () => {
    await setViewport(DESKTOP_VIEWPORT.width, DESKTOP_VIEWPORT.height);
    const { root } = await render(
      <weg-header layout={SAMPLE_HEADER_LAYOUT} currentPath="/career-advice/my-article"></weg-header>,
    );

    const careerLink = root.shadowRoot?.querySelector('.nav-link') as HTMLAnchorElement | null;
    expect(careerLink?.classList.contains('nav-link--active')).toBe(true);
    expect(careerLink?.getAttribute('aria-current')).toBe('page');

    const dropdownTrigger = root.shadowRoot?.querySelector('.nav-dropdown__trigger') as HTMLButtonElement | null;
    expect(dropdownTrigger?.classList.contains('nav-dropdown__trigger--active')).toBe(false);
  });

  it('keeps dropdown parent active when a child matches current-path', async () => {
    await setViewport(DESKTOP_VIEWPORT.width, DESKTOP_VIEWPORT.height);
    const { root } = await render(
      <weg-header
        layout={SAMPLE_HEADER_LAYOUT}
        currentPath="/search?category=graduates"
      ></weg-header>,
    );

    const dropdownTrigger = root.shadowRoot?.querySelector('.nav-dropdown__trigger') as HTMLButtonElement | null;
    expect(dropdownTrigger?.classList.contains('nav-dropdown__trigger--active')).toBe(true);

    dropdownTrigger?.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    await waitForUpdate();

    const childLink = root.shadowRoot?.querySelector('.nav-dropdown__link--active') as HTMLAnchorElement | null;
    expect(childLink?.getAttribute('aria-current')).toBe('page');
    expect(root.shadowRoot?.querySelectorAll('[aria-current="page"]')).toHaveLength(1);
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

  it('renders auth icon for authAction sign-in without relying on label', async () => {
    const { root } = await render(
      <weg-header
        layout={{
          header: {
            menu: [{ label: 'Log in', href: '/account/login', authAction: 'sign-in' }],
          },
        }}
      ></weg-header>,
    );

    const authLink = root.shadowRoot?.querySelector('.main-nav .sign-in-link') as HTMLAnchorElement | null;
    expect(authLink).toBeTruthy();
    expect(authLink?.textContent).toContain('Log in');
    expect(root.shadowRoot?.querySelector('.main-nav .sign-in-link svg')).toBeTruthy();
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

  it('does not navigate on sign-out when host prevents default', async () => {
    const hrefBefore = window.location.href;
    const { root } = await render(<weg-header layout={SAMPLE_HEADER_LAYOUT} signed-in></weg-header>);

    root.addEventListener('wegAuthClick', ((event: Event) => {
      event.preventDefault();
    }) as EventListener);

    const signOutLink = root.shadowRoot?.querySelector('.main-nav .sign-out-link') as HTMLAnchorElement | null;
    signOutLink?.click();

    expect(window.location.href).toBe(hrefBefore);
  });

  it('opens desktop dropdown on trigger click', async () => {
    await setViewport(DESKTOP_VIEWPORT.width, DESKTOP_VIEWPORT.height);
    const { root } = await render(<weg-header layout={MULTI_DROPDOWN_HEADER_LAYOUT}></weg-header>);

    const triggers = root.shadowRoot?.querySelectorAll(
      '.nav-dropdown__trigger',
    ) as NodeListOf<HTMLButtonElement> | undefined;
    expect(triggers?.length).toBe(3);

    const trigger = triggers?.[0] ?? null;
    expect(trigger?.getAttribute('aria-expanded')).toBe('false');
    trigger?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
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

  it('navigates submenu links with arrow keys and returns focus on Escape', async () => {
    await setViewport(DESKTOP_VIEWPORT.width, DESKTOP_VIEWPORT.height);
    const { root } = await render(<weg-header layout={MULTI_DROPDOWN_HEADER_LAYOUT}></weg-header>);

    const trigger = root.shadowRoot?.querySelector('.nav-dropdown__trigger') as HTMLButtonElement | null;
    expect(trigger).toBeTruthy();

    trigger?.focus();
    trigger?.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    await waitForUpdate();
    await new Promise((resolve) => setTimeout(resolve, 0));

    const links = root.shadowRoot?.querySelectorAll(
      '.nav-dropdown__link',
    ) as NodeListOf<HTMLAnchorElement>;
    expect(links.length).toBeGreaterThan(1);
    expect(root.shadowRoot?.activeElement).toBe(links[0]);

    links[0].dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(root.shadowRoot?.activeElement).toBe(links[1]);

    links[1].dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true }));
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(root.shadowRoot?.activeElement).toBe(links[0]);

    links[0].dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    await waitForUpdate();
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(trigger?.getAttribute('aria-expanded')).toBe('false');
    expect(root.shadowRoot?.querySelector('.nav-dropdown__panel')).toBeFalsy();
    expect(root.shadowRoot?.activeElement).toBe(trigger);
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

  it('uses descriptive main navigation labels on the mobile menu toggle', async () => {
    await setViewport(MOBILE_VIEWPORT.width, MOBILE_VIEWPORT.height);
    const { root } = await render(<weg-header layout={SAMPLE_HEADER_LAYOUT}></weg-header>);

    const openButton = root.shadowRoot?.querySelector('.menu-toggle') as HTMLButtonElement | null;
    expect(openButton?.getAttribute('aria-label')).toBe('Open main navigation');

    await userEvent.click(openButton!);
    await waitForUpdate();

    expect(openButton?.getAttribute('aria-label')).toBe('Close main navigation');
    expect(root.shadowRoot?.querySelector('.main-nav-panel')?.getAttribute('aria-label')).toBe(
      'Main navigation',
    );
    expect(root.shadowRoot?.querySelector('.main-nav')?.getAttribute('aria-label')).toBe('Main navigation');
  });

  it('announces main navigation open and close via live region', async () => {
    await setViewport(MOBILE_VIEWPORT.width, MOBILE_VIEWPORT.height);
    const { root } = await render(<weg-header layout={SAMPLE_HEADER_LAYOUT}></weg-header>);

    const openButton = root.shadowRoot?.querySelector('.menu-toggle') as HTMLButtonElement | null;
    await userEvent.click(openButton!);
    await waitForUpdate();
    await new Promise((resolve) => setTimeout(resolve, 0));

    const liveRegion = root.shadowRoot?.querySelector('[data-weg-sr-live]');
    expect(liveRegion?.textContent).toBe('Main navigation opened. 3 items.');

    await userEvent.click(openButton!);
    await waitForUpdate();
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(liveRegion?.textContent).toBe('Main navigation closed.');
  });

  it('moves focus to the first nav item when the mobile menu opens', async () => {
    await setViewport(MOBILE_VIEWPORT.width, MOBILE_VIEWPORT.height);
    const { root } = await render(<weg-header layout={SAMPLE_HEADER_LAYOUT}></weg-header>);

    const openButton = root.shadowRoot?.querySelector('.menu-toggle') as HTMLButtonElement | null;
    await userEvent.click(openButton!);
    await waitForUpdate();
    await new Promise((resolve) => {
      requestAnimationFrame(() => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    });

    const firstNavItem = root.shadowRoot?.querySelector('.nav-dropdown__trigger') as HTMLElement | null;
    expect(root.shadowRoot?.activeElement).toBe(firstNavItem);
  });

  it('returns focus to the menu toggle when Escape closes the mobile menu', async () => {
    await setViewport(MOBILE_VIEWPORT.width, MOBILE_VIEWPORT.height);
    const { root } = await render(<weg-header layout={SAMPLE_HEADER_LAYOUT}></weg-header>);

    const openButton = root.shadowRoot?.querySelector('.menu-toggle') as HTMLButtonElement | null;
    await userEvent.click(openButton!);
    await waitForUpdate();
    await new Promise((resolve) => {
      requestAnimationFrame(() => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    });

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    await waitForUpdate();
    await new Promise((resolve) => {
      requestAnimationFrame(() => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    });

    expect(openButton?.getAttribute('aria-expanded')).toBe('false');
    expect(root.shadowRoot?.activeElement).toBe(openButton);
  });

  it('traps Tab focus within the open mobile menu', async () => {
    await setViewport(MOBILE_VIEWPORT.width, MOBILE_VIEWPORT.height);
    const { root } = await render(<weg-header layout={SAMPLE_HEADER_LAYOUT}></weg-header>);

    const openButton = root.shadowRoot?.querySelector('.menu-toggle') as HTMLButtonElement | null;
    await userEvent.click(openButton!);
    await waitForUpdate();
    await new Promise((resolve) => {
      requestAnimationFrame(() => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    });

    const focusables = Array.from(
      root.shadowRoot?.querySelectorAll<HTMLElement>(
        '.header a[href]:not([tabindex="-1"]), .header button:not([disabled]):not([tabindex="-1"])',
      ) ?? [],
    );
    const lastFocusable = focusables[focusables.length - 1];
    expect(lastFocusable).toBeTruthy();
    expect(openButton).toBe(focusables[0]);

    lastFocusable!.focus();
    window.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true }),
    );
    expect(root.shadowRoot?.activeElement).toBe(openButton);

    openButton!.focus();
    window.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Tab', shiftKey: true, bubbles: true, cancelable: true }),
    );
    expect(root.shadowRoot?.activeElement).toBe(lastFocusable);
  });

  it('exposes submenu link position within the set', async () => {
    await setViewport(DESKTOP_VIEWPORT.width, DESKTOP_VIEWPORT.height);
    const { root } = await render(<weg-header layout={MULTI_DROPDOWN_HEADER_LAYOUT}></weg-header>);

    const trigger = root.shadowRoot?.querySelector('.nav-dropdown__trigger') as HTMLButtonElement | null;
    trigger?.focus();
    trigger?.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    await waitForUpdate();
    await new Promise((resolve) => setTimeout(resolve, 0));

    const links = root.shadowRoot?.querySelectorAll(
      '.nav-dropdown__link',
    ) as NodeListOf<HTMLAnchorElement>;
    expect(links.length).toBe(2);
    expect(links[0]?.getAttribute('aria-label')).toBe('Graduates, link 1 of 2');
    expect(links[1]?.getAttribute('aria-label')).toBe('Senior roles, link 2 of 2');
  });

  it('announces submenu expand and collapse via live region', async () => {
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
    await new Promise((resolve) => setTimeout(resolve, 0));

    const liveRegion = root.shadowRoot?.querySelector('[data-weg-sr-live]');
    expect(liveRegion?.textContent).toBe('Find a job submenu expanded. 1 link.');

    await userEvent.click(accordionButton!);
    await waitForUpdate();
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(liveRegion?.textContent).toBe('Find a job submenu collapsed.');
  });

  it('focuses the next sibling and its first h1 when skip link is activated', async () => {
    const { root } = await render(<weg-header layout={SAMPLE_HEADER_LAYOUT}></weg-header>);

    const content = document.createElement('div');
    content.className = 'page-content';
    const heading = document.createElement('h1');
    heading.textContent = 'Page title';
    content.append(heading);
    root.insertAdjacentElement('afterend', content);

    const skipLink = root.shadowRoot?.querySelector('.skip-to-content') as HTMLAnchorElement | null;
    skipLink?.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));

    expect(content.getAttribute('tabindex')).toBe('-1');
    expect(heading.getAttribute('tabindex')).toBe('-1');
    expect(document.activeElement).toBe(heading);

    content.remove();
  });

  describe('scroll hide', () => {
    function getHeaderBar(root: HTMLElement) {
      return root.shadowRoot?.querySelector('header.header');
    }

    async function setScrollPosition(y: number, root: HTMLElement) {
      Object.defineProperty(window, 'scrollY', {
        configurable: true,
        value: y,
      });
      window.dispatchEvent(new Event('scroll'));
      await waitForUpdate();
      await (root as HTMLWegHeaderElement).componentOnReady();
    }

    beforeEach(async () => {
      Object.defineProperty(window, 'scrollY', {
        configurable: true,
        value: 0,
      });
    });

    it('stays visible when scrolling down below 50vh', async () => {
      await setViewport(DESKTOP_VIEWPORT.width, DESKTOP_VIEWPORT.height);
      const { root } = await render(<weg-header layout={SAMPLE_HEADER_LAYOUT}></weg-header>);
      await waitForUpdate();

      await setScrollPosition(100, root);

      expect(getHeaderBar(root)?.classList.contains('header--scroll-hidden')).toBe(false);
      expect(getHeaderBar(root)?.classList.contains('header--scroll-mode')).toBe(false);
    });

    it('hides when scrolling down past 50vh', async () => {
      await setViewport(DESKTOP_VIEWPORT.width, DESKTOP_VIEWPORT.height);
      const { root } = await render(<weg-header layout={SAMPLE_HEADER_LAYOUT}></weg-header>);
      await waitForUpdate();

      await setScrollPosition(400, root);

      expect(getHeaderBar(root)?.classList.contains('header--scroll-hidden')).toBe(true);
      expect(getHeaderBar(root)?.classList.contains('header--scroll-mode')).toBe(true);
    });

    it('returns to normal flow when scrolling up below 50vh while hidden', async () => {
      await setViewport(DESKTOP_VIEWPORT.width, DESKTOP_VIEWPORT.height);
      const { root } = await render(<weg-header layout={SAMPLE_HEADER_LAYOUT}></weg-header>);
      await waitForUpdate();

      await setScrollPosition(500, root);
      expect(getHeaderBar(root)?.classList.contains('header--scroll-hidden')).toBe(true);
      expect(getHeaderBar(root)?.classList.contains('header--scroll-mode')).toBe(true);

      await setScrollPosition(300, root);

      expect(getHeaderBar(root)?.classList.contains('header--scroll-hidden')).toBe(false);
      expect(getHeaderBar(root)?.classList.contains('header--scroll-mode')).toBe(false);
    });

    it('stays pinned when scrolling up below 50vh after reveal', async () => {
      await setViewport(DESKTOP_VIEWPORT.width, DESKTOP_VIEWPORT.height);
      const { root } = await render(<weg-header layout={SAMPLE_HEADER_LAYOUT}></weg-header>);
      await waitForUpdate();

      await setScrollPosition(500, root);
      await setScrollPosition(400, root);

      expect(getHeaderBar(root)?.classList.contains('header--scroll-hidden')).toBe(false);
      expect(getHeaderBar(root)?.classList.contains('header--scroll-mode')).toBe(true);

      await setScrollPosition(300, root);

      expect(getHeaderBar(root)?.classList.contains('header--scroll-hidden')).toBe(false);
      expect(getHeaderBar(root)?.classList.contains('header--scroll-mode')).toBe(true);

      await setScrollPosition(0, root);

      expect(getHeaderBar(root)?.classList.contains('header--scroll-hidden')).toBe(false);
      expect(getHeaderBar(root)?.classList.contains('header--scroll-mode')).toBe(false);
    });

    it('reveals when scrolling up past 50vh', async () => {
      await setViewport(DESKTOP_VIEWPORT.width, DESKTOP_VIEWPORT.height);
      const { root } = await render(<weg-header layout={SAMPLE_HEADER_LAYOUT}></weg-header>);
      await waitForUpdate();

      await setScrollPosition(500, root);
      expect(getHeaderBar(root)?.classList.contains('header--scroll-hidden')).toBe(true);

      await setScrollPosition(400, root);

      expect(getHeaderBar(root)?.classList.contains('header--scroll-hidden')).toBe(false);
    });

    it('reveals when scrolled back to the top', async () => {
      await setViewport(DESKTOP_VIEWPORT.width, DESKTOP_VIEWPORT.height);
      const { root } = await render(<weg-header layout={SAMPLE_HEADER_LAYOUT}></weg-header>);
      await waitForUpdate();

      await setScrollPosition(500, root);
      expect(getHeaderBar(root)?.classList.contains('header--scroll-hidden')).toBe(true);

      await setScrollPosition(0, root);

      expect(getHeaderBar(root)?.classList.contains('header--scroll-hidden')).toBe(false);
    });

    it('stays visible while the mobile menu is open', async () => {
      await setViewport(MOBILE_VIEWPORT.width, MOBILE_VIEWPORT.height);
      const { root } = await render(<weg-header layout={SAMPLE_HEADER_LAYOUT}></weg-header>);
      await waitForUpdate();

      const openButton = root.shadowRoot?.querySelector('.menu-toggle') as HTMLButtonElement | null;
      await userEvent.click(openButton!);
      await waitForUpdate();

      await setScrollPosition(200, root);

      expect(getHeaderBar(root)?.classList.contains('header--scroll-hidden')).toBe(false);
      expect(getHeaderBar(root)?.classList.contains('header--menu-open')).toBe(true);
    });
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
      const { root } = await render(<weg-header layout={MULTI_DROPDOWN_HEADER_LAYOUT}></weg-header>);
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
