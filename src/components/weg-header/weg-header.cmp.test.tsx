import { render, h, describe, it, expect } from '@stencil/vitest';

const SAMPLE_HEADER_LAYOUT = {
  header: {
    dropdowns: [
      {
        label: 'Find a job',
        items: [{ label: 'Graduates', href: '/search?category=graduates' }],
      },
    ],
    links: [{ label: 'Career advice', href: '/career-advice' }],
    signIn: { label: 'Sign in', href: '/account/login' },
    signOut: { label: 'Sign out' },
  },
};

describe('weg-header', () => {
  it('renders safely when layout is undefined', async () => {
    const { root } = await render(<weg-header></weg-header>);
    expect(root).toBeTruthy();
    const header = root.shadowRoot?.querySelector('.header');
    expect(header).toBeTruthy();
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
  });

  it('emits wegAuthClick when auth control is clicked', async () => {
    const { root } = await render(<weg-header layout={SAMPLE_HEADER_LAYOUT}></weg-header>);
    let detail: { action: string } | undefined;
    root.addEventListener('wegAuthClick', ((event: CustomEvent<{ action: string }>) => {
      detail = event.detail;
      event.preventDefault();
    }) as EventListener);

    const authLink = root.shadowRoot?.querySelector('.desktop .sign-in-link') as HTMLAnchorElement | null;
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

    const signOutLink = root.shadowRoot?.querySelector('.desktop .sign-out-link') as HTMLAnchorElement | null;
    expect(signOutLink).toBeTruthy();
    signOutLink?.click();

    expect(detail).toEqual({ action: 'sign-out' });
  });

  it('toggles mobile accordion aria-expanded', async () => {
    const { root } = await render(<weg-header layout={SAMPLE_HEADER_LAYOUT}></weg-header>);

    const openButton = root.shadowRoot?.querySelector('.mobile .icon-button') as HTMLButtonElement | null;
    expect(openButton).toBeTruthy();
    openButton?.click();
    await new Promise((r) => setTimeout(r, 0));

    const accordionButton = root.shadowRoot?.querySelector('.mobile-nav__row') as HTMLButtonElement | null;
    expect(accordionButton?.getAttribute('aria-expanded')).toBe('false');
    accordionButton?.click();
    await new Promise((r) => setTimeout(r, 0));
    expect(accordionButton?.getAttribute('aria-expanded')).toBe('true');
  });
});
