import { Component, Prop, State, Watch, Element, Event, EventEmitter, h, Listen } from '@stencil/core';
import type { LayoutData, LayoutHeaderAuthAction, LayoutHeaderLink } from '../../types/layout-data';
import { normalizeLinks, parseJsonProp, isNonEmptyString } from '../../utils/layout';
import { LOGO_SRC } from './logo-data';
import { DEFAULT_LOGO_HREF, SIGNED_IN_HEADER } from './signed-in-layout';

type HeaderLink = LayoutHeaderLink;

type HeaderSignOutLink = {
  label: string;
  href?: string;
};

type HeaderDropdown = {
  label: string;
  items: HeaderLink[];
};

type HeaderData = {
  logoHref: string;
  dropdowns: HeaderDropdown[];
  links: HeaderLink[];
  signIn: HeaderLink | null;
  signOut: HeaderSignOutLink | null;
};

type AuthControl = {
  label: string;
  href?: string;
  action: LayoutHeaderAuthAction;
};

const EMPTY_HEADER: HeaderData = {
  logoHref: DEFAULT_LOGO_HREF,
  dropdowns: [],
  links: [],
  signIn: null,
  signOut: null,
};

function normalizeDropdowns(input: unknown): HeaderDropdown[] {
  if (!Array.isArray(input)) return [];
  const result: HeaderDropdown[] = [];
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

function normalizeSignIn(input: unknown): HeaderLink | null {
  if (!input || typeof input !== 'object') return null;
  const label = (input as { label?: unknown }).label;
  const href = (input as { href?: unknown }).href;
  if (!isNonEmptyString(label)) return null;
  if (!isNonEmptyString(href)) return null;
  return { label: label.trim(), href: href.trim() };
}

function normalizeSignOut(input: unknown): HeaderSignOutLink | null {
  if (!input || typeof input !== 'object') return null;
  const label = (input as { label?: unknown }).label;
  const href = (input as { href?: unknown }).href;
  if (!isNonEmptyString(label)) return null;
  return {
    label: label.trim(),
    href: isNonEmptyString(href) ? href.trim() : undefined,
  };
}

function normalizeHeaderData(input: unknown): HeaderData {
  const root = (input && typeof input === 'object' ? input : {}) as LayoutData;
  const header = root.header && typeof root.header === 'object' ? root.header : {};
  const logoHref = isNonEmptyString(header.logoHref) ? header.logoHref.trim() : DEFAULT_LOGO_HREF;

  return {
    logoHref,
    dropdowns: normalizeDropdowns(header.dropdowns),
    links: normalizeLinks(header.links),
    signIn: normalizeSignIn(header.signIn),
    signOut: normalizeSignOut(header.signOut),
  };
}

function SignInIcon() {
  return (
    <svg viewBox="0 0 448 512" width="20" height="20" aria-hidden="true" focusable="false">
      <path
        d="M304 128a80 80 0 1 0 -160 0 80 80 0 1 0 160 0zM96 128a128 128 0 1 1 256 0A128 128 0 1 1 96 128zM49.3 464l349.5 0c-8.9-63.3-63.3-112-129-112l-91.4 0c-65.7 0-120.1 48.7-129 112zM0 482.3C0 383.8 79.8 304 178.3 304l91.4 0C368.2 304 448 383.8 448 482.3c0 16.4-13.3 29.7-29.7 29.7L29.7 512C13.3 512 0 498.7 0 482.3z"
        fill="currentColor"
      />
    </svg>
  );
}

function SignOutIcon() {
  return (
    <svg viewBox="0 0 26 24" width="26" height="24" aria-hidden="true" focusable="false" fill="none">
      <path
        d="M19.6667 6.33333L25 11.6667L19.6667 17M25 11.6667H6.33333M14.3333 17V18.3333C14.3333 19.3942 13.9119 20.4116 13.1618 21.1618C12.4116 21.9119 11.3942 22.3333 10.3333 22.3333H5C3.93913 22.3333 2.92172 21.9119 2.17157 21.1618C1.42143 20.4116 1 19.3942 1 18.3333V5C1 3.93913 1.42143 2.92172 2.17157 2.17157C2.92172 1.42143 3.93913 1 5 1H10.3333C11.3942 1 12.4116 1.42143 13.1618 2.17157C13.9119 2.92172 14.3333 3.93913 14.3333 5V6.33333"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
  );
}

function HamburgerIcon() {
  return (
    <svg viewBox="0 0 24 24" width="28" height="28" aria-hidden="true" focusable="false" fill="none">
      <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" focusable="false" fill="none">
      <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
    </svg>
  );
}

function ToggleIcon({ expanded }: { expanded: boolean }) {
  return (
    <span class="toggle-icon" aria-hidden="true">
      {expanded ? (
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none">
          <path d="M6 12h12" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none">
          <path d="M12 6v12M6 12h12" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" />
        </svg>
      )}
    </span>
  );
}

function Logo({ href }: { href: string }) {
  return (
    <a class="logo-link" href={href} aria-label="Home">
      <img class="logo" src={LOGO_SRC} alt="WEG" width="225" height="83" />
    </a>
  );
}

@Component({
  tag: 'weg-header',
  styleUrls: ['../../styles/shared.css', 'weg-header.css'],
  shadow: true,
})
export class WegHeader {
  /**
   * Layout payload, supplied by the host application.
   *
   * Expected shape:
   * ```json
   * {
   *   "header": {
   *     "logoHref": "https://www.warwickemploymentgroup.com/",
   *     "dropdowns": [{ "label": "Find a job", "items": [{ "label": "...", "href": "..." }] }],
   *     "links": [{ "label": "Career advice", "href": "/career-advice" }],
   *     "signIn": { "label": "Sign in", "href": "/account/login" },
   *     "signOut": { "label": "Sign out", "href": "/account/login" }
   *   }
   * }
   * ```
   */
  @Prop() layout?: LayoutData | string;

  /**
   * When true, the header shows the signed-in navigation (Find a job, Dashboard,
   * Manage Account, Sign out) instead of the CMS layout.
   */
  @Prop({ attribute: 'signed-in', reflect: true }) signedIn = false;

  /**
   * Signed-in user's first name, shown beside the profile icon on Manage Account.
   */
  @Prop({ attribute: 'user-name' }) userName?: string;

  /**
   * Fired when the user clicks Sign in or Sign out.
   * Call `event.preventDefault()` in the host to handle navigation/logout yourself.
   */
  @Event({ eventName: 'wegAuthClick' }) wegAuthClick!: EventEmitter<{ action: LayoutHeaderAuthAction }>;

  @Element() el!: HTMLElement;

  @State() private resolved: HeaderData = EMPTY_HEADER;
  @State() private menuOpen = false;
  @State() private openDropdown: string | null = null;
  @State() private expandedSection: string | null = null;

  private boundHandleDocumentClick = this.handleDocumentClick.bind(this);

  private resolve() {
    if (this.layout === undefined || this.layout === null) {
      this.resolved = EMPTY_HEADER;
      return;
    }
    this.resolved = normalizeHeaderData(parseJsonProp(this.layout));
  }

  componentWillLoad() {
    this.resolve();
  }

  connectedCallback() {
    document.addEventListener('click', this.boundHandleDocumentClick);
  }

  disconnectedCallback() {
    document.removeEventListener('click', this.boundHandleDocumentClick);
  }

  @Watch('layout')
  protected watchLayout() {
    this.resolve();
  }

  @Listen('keydown', { target: 'window' })
  handleKeyDown(event: KeyboardEvent) {
    if (event.key !== 'Escape') return;
    this.menuOpen = false;
    this.openDropdown = null;
  }

  private handleDocumentClick(event: MouseEvent) {
    const target = event.target as Node | null;
    if (!target || !this.el.contains(target)) {
      this.openDropdown = null;
    }
  }

  private toggleDropdown(label: string) {
    this.openDropdown = this.openDropdown === label ? null : label;
  }

  private toggleAccordion(label: string) {
    this.expandedSection = this.expandedSection === label ? null : label;
  }

  private openMenu() {
    this.menuOpen = true;
    this.expandedSection = null;
  }

  private closeMenu() {
    this.menuOpen = false;
    this.expandedSection = null;
  }

  private getActiveHeaderData(): HeaderData {
    if (!this.signedIn) return this.resolved;

    return {
      logoHref: SIGNED_IN_HEADER.logoHref,
      dropdowns: [],
      links: [...SIGNED_IN_HEADER.links],
      signIn: null,
      signOut: SIGNED_IN_HEADER.signOut,
    };
  }

  private getLogoHref(): string {
    return this.getActiveHeaderData().logoHref;
  }

  private getManageAccountLabel(): string {
    const name = this.userName?.trim();
    return name || 'Manage Account';
  }

  private getAuthControl(): AuthControl | null {
    if (this.signedIn) return null;

    const signIn = this.resolved.signIn;
    if (!signIn) return null;
    return { label: signIn.label, href: signIn.href, action: 'sign-in' };
  }

  private handleAuthClick(event: MouseEvent, onNavigate?: () => void) {
    const auth = this.getAuthControl() ?? {
      label: SIGNED_IN_HEADER.signOut.label,
      href: SIGNED_IN_HEADER.signOut.href,
      action: 'sign-out' as const,
    };

    const emitted = this.wegAuthClick.emit({ action: auth.action });

    if (emitted.defaultPrevented) {
      event.preventDefault();
      onNavigate?.();
      return;
    }

    if (auth.action === 'sign-out') {
      event.preventDefault();
      if (auth.href) {
        window.location.assign(auth.href);
      }
      onNavigate?.();
      return;
    }

    onNavigate?.();
  }

  private renderAuthControl(options: { iconOnly?: boolean; className?: string; onNavigate?: () => void }) {
    const auth = this.getAuthControl();
    if (!auth) return null;

    const sharedClass = {
      'sign-in-link': !options.iconOnly,
      'icon-button': !!options.iconOnly,
      [options.className || '']: !!options.className,
    };

    const content = [
      <SignInIcon key="icon" />,
      !options.iconOnly ? auth.label : null,
      options.iconOnly ? <span class="sr-only">{auth.label}</span> : null,
    ];

    return (
      <a
        class={sharedClass}
        href={auth.href}
        aria-label={auth.label}
        onClick={(event) => this.handleAuthClick(event, options.onNavigate)}
      >
        {content}
      </a>
    );
  }

  private renderSignedInAuthControls(options: { iconOnly?: boolean; onNavigate?: () => void }) {
    const manageAccountLabel = this.getManageAccountLabel();
    const signOut = SIGNED_IN_HEADER.signOut;

    if (options.iconOnly) {
      return (
        <a
          class="icon-button manage-account-link"
          href={SIGNED_IN_HEADER.manageAccount.href}
          aria-label={manageAccountLabel}
          onClick={() => options.onNavigate?.()}
        >
          <SignInIcon />
          <span class="sr-only">{manageAccountLabel}</span>
        </a>
      );
    }

    return [
      <li class="desktop-nav__item" key="manage-account">
        <a
          class="sign-in-link manage-account-link"
          href={SIGNED_IN_HEADER.manageAccount.href}
          aria-label={manageAccountLabel}
          onClick={() => options.onNavigate?.()}
        >
          <SignInIcon />
          {manageAccountLabel}
        </a>
      </li>,
      <li class="desktop-nav__item" key="sign-out">
        <a
          class="sign-in-link sign-out-link"
          href={signOut.href}
          aria-label={signOut.label}
          onClick={(event) => this.handleAuthClick(event, options.onNavigate)}
        >
          <SignOutIcon />
          {signOut.label}
        </a>
      </li>,
    ];
  }

  private renderDesktop() {
    const { dropdowns, links } = this.getActiveHeaderData();

    return (
      <div class="desktop">
        <Logo href={this.getLogoHref()} />
        <nav class="desktop-nav" aria-label="Main">
          <ul class="desktop-nav__list">
            {dropdowns.map((dropdown) => {
              const isOpen = this.openDropdown === dropdown.label;
              return (
                <li class="desktop-nav__item" key={dropdown.label}>
                  <button
                    type="button"
                    class={{
                      'dropdown-trigger': true,
                      'dropdown-trigger--open': isOpen,
                    }}
                    aria-expanded={isOpen ? 'true' : 'false'}
                    aria-haspopup="true"
                    onClick={(event) => {
                      event.stopPropagation();
                      this.toggleDropdown(dropdown.label);
                    }}
                  >
                    {dropdown.label}
                    <ToggleIcon expanded={isOpen} />
                  </button>
                  {isOpen ? (
                    <div class="dropdown-panel" role="region" aria-label={dropdown.label}>
                      <div class="dropdown-panel__accent">
                        <div class="dropdown-panel__links">
                          {dropdown.items.map((item) => (
                            <a class="dropdown-panel__link" href={item.href} key={`${dropdown.label}:${item.label}`}>
                              {item.label}
                            </a>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : null}
                </li>
              );
            })}
            {links.map((link) => (
              <li class="desktop-nav__item" key={link.label}>
                <a class="nav-link" href={link.href}>
                  {link.label}
                </a>
              </li>
            ))}
            {this.signedIn
              ? this.renderSignedInAuthControls({})
              : this.getAuthControl()
                ? <li class="desktop-nav__item">{this.renderAuthControl({})}</li>
                : null}
          </ul>
        </nav>
      </div>
    );
  }

  private renderMobileBar() {
    return (
      <div class="mobile">
        <button type="button" class="icon-button" aria-label="Open menu" onClick={() => this.openMenu()}>
          <HamburgerIcon />
        </button>
        <Logo href={this.getLogoHref()} />
        {this.signedIn
          ? this.renderSignedInAuthControls({ iconOnly: true })
          : this.renderAuthControl({ iconOnly: true })}
      </div>
    );
  }

  private renderMobileOverlay() {
    if (!this.menuOpen) return null;

    const { dropdowns, links } = this.getActiveHeaderData();

    return (
      <div class="mobile-overlay" role="dialog" aria-modal="true" aria-label="Menu">
        <div class="mobile-overlay__header">
          <button type="button" class="icon-button" aria-label="Close menu" onClick={() => this.closeMenu()}>
            <CloseIcon />
          </button>
          <div class="mobile-overlay__logo">
            <Logo href={this.getLogoHref()} />
          </div>
          {this.signedIn
            ? this.renderSignedInAuthControls({ iconOnly: true, onNavigate: () => this.closeMenu() })
            : this.renderAuthControl({ iconOnly: true, onNavigate: () => this.closeMenu() })}
        </div>
        <nav class="mobile-nav" aria-label="Main">
          {dropdowns.map((dropdown) => {
            const isExpanded = this.expandedSection === dropdown.label;
            return (
              <div class="mobile-nav__section" key={dropdown.label}>
                <button
                  type="button"
                  class="mobile-nav__row"
                  aria-expanded={isExpanded ? 'true' : 'false'}
                  onClick={() => this.toggleAccordion(dropdown.label)}
                >
                  <span>{dropdown.label}</span>
                  <ToggleIcon expanded={isExpanded} />
                </button>
                {isExpanded ? (
                  <div class="mobile-nav__sub">
                    {dropdown.items.map((item) => (
                      <a
                        class="mobile-nav__sub-link"
                        href={item.href}
                        key={`${dropdown.label}:${item.label}`}
                        onClick={() => this.closeMenu()}
                      >
                        {item.label}
                      </a>
                    ))}
                  </div>
                ) : null}
              </div>
            );
          })}
          {links.map((link) => (
            <div class="mobile-nav__section" key={link.label}>
              <a class="mobile-nav__row" href={link.href} onClick={() => this.closeMenu()}>
                {link.label}
              </a>
            </div>
          ))}
          {this.signedIn ? (
            <div class="mobile-nav__section">
              <a
                class="mobile-nav__row manage-account-link"
                href={SIGNED_IN_HEADER.manageAccount.href}
                onClick={() => this.closeMenu()}
              >
                {this.getManageAccountLabel()}
              </a>
              <a
                class="mobile-nav__row sign-out-link"
                href={SIGNED_IN_HEADER.signOut.href}
                onClick={(event) => this.handleAuthClick(event, () => this.closeMenu())}
              >
                <SignOutIcon />
                {SIGNED_IN_HEADER.signOut.label}
              </a>
            </div>
          ) : null}
        </nav>
      </div>
    );
  }

  render() {
    return (
      <header class="header">
        <div class="container">
          {this.renderDesktop()}
          {this.renderMobileBar()}
        </div>
        {this.renderMobileOverlay()}
      </header>
    );
  }
}
