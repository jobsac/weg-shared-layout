import { Component, Prop, State, Watch, Element, Event, EventEmitter, h, Listen } from '@stencil/core';
import type { LayoutData, LayoutHeaderAuthAction, LayoutHeaderLink } from '../../types/layout-data';
import { normalizeLinks, parseJsonProp, isNonEmptyString } from '../../utils/layout';
import { WEG_DESKTOP_MEDIA_QUERY } from '../../constants/breakpoints';
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

  private boundHandleDocumentClick = this.handleDocumentClick.bind(this);
  private boundHandleViewportChange = this.handleViewportChange.bind(this);
  private hoverCloseTimer: ReturnType<typeof setTimeout> | null = null;
  private hoverOpenEnabled = false;
  private desktopMediaQuery?: MediaQueryList;

  private resolve() {
    if (this.layout === undefined || this.layout === null) {
      this.resolved = EMPTY_HEADER;
      return;
    }
    this.resolved = normalizeHeaderData(parseJsonProp(this.layout));
  }

  componentWillLoad() {
    this.resolve();
    this.hoverOpenEnabled = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    this.desktopMediaQuery = window.matchMedia(WEG_DESKTOP_MEDIA_QUERY);
    this.desktopMediaQuery.addEventListener('change', this.boundHandleViewportChange);
    this.handleViewportChange();
  }

  connectedCallback() {
    document.addEventListener('click', this.boundHandleDocumentClick);
  }

  disconnectedCallback() {
    document.removeEventListener('click', this.boundHandleDocumentClick);
    this.desktopMediaQuery?.removeEventListener('change', this.boundHandleViewportChange);
    this.cancelScheduledDropdownClose();
  }

  private handleViewportChange() {
    if (this.desktopMediaQuery?.matches) {
      this.closeMenu();
    }
  }

  private isMobileMenuActive(): boolean {
    return this.menuOpen && !this.desktopMediaQuery?.matches;
  }

  @Watch('layout')
  protected watchLayout() {
    this.resolve();
  }

  @Listen('keydown', { target: 'window' })
  handleKeyDown(event: KeyboardEvent) {
    if (event.key !== 'Escape') return;
    this.menuOpen = false;
    this.closeDropdown();
  }

  private handleDocumentClick(event: MouseEvent) {
    const target = event.target as Node | null;
    if (!target || !this.el.contains(target)) {
      this.closeDropdown();
    }
  }

  private cancelScheduledDropdownClose() {
    if (!this.hoverCloseTimer) return;
    clearTimeout(this.hoverCloseTimer);
    this.hoverCloseTimer = null;
  }

  private openDropdownMenu(label: string) {
    this.cancelScheduledDropdownClose();
    this.openDropdown = label;
  }

  private closeDropdown() {
    this.cancelScheduledDropdownClose();
    this.openDropdown = null;
  }

  private scheduleDropdownClose() {
    this.cancelScheduledDropdownClose();
    this.hoverCloseTimer = setTimeout(() => {
      this.openDropdown = null;
      this.hoverCloseTimer = null;
    }, 200);
  }

  private toggleDropdown(label: string) {
    if (this.openDropdown === label) {
      this.closeDropdown();
      return;
    }
    this.openDropdownMenu(label);
  }

  private getDropdownPanelId(label: string): string {
    return `weg-header-dropdown-${label.trim().toLowerCase().replace(/\s+/g, '-')}`;
  }

  private handleDropdownPointerEnter(label: string) {
    if (!this.hoverOpenEnabled) return;
    this.openDropdownMenu(label);
  }

  private handleDropdownPointerLeave() {
    if (!this.hoverOpenEnabled) return;
    this.scheduleDropdownClose();
  }

  private handleDropdownFocusIn(label: string) {
    this.openDropdownMenu(label);
  }

  private handleDropdownFocusOut(event: FocusEvent, label: string) {
    const related = event.relatedTarget as Node | null;
    const currentTarget = event.currentTarget as HTMLElement;
    if (related && currentTarget.contains(related)) return;
    if (this.openDropdown === label) {
      this.closeDropdown();
    }
  }

  private handleDropdownTriggerKeyDown(
    event: KeyboardEvent,
    label: string,
    itemEl: HTMLElement,
  ) {
    if (event.key !== 'ArrowDown') return;
    event.preventDefault();
    this.openDropdownMenu(label);
    this.focusFirstDropdownLink(itemEl);
  }

  private focusFirstDropdownLink(itemEl: HTMLElement) {
    setTimeout(() => {
      const firstLink = itemEl.querySelector('.nav-dropdown__link') as HTMLAnchorElement | null;
      firstLink?.focus();
    }, 0);
  }

  private toggleMenu() {
    if (this.menuOpen) {
      this.closeMenu();
      return;
    }
    this.openMenu();
  }

  private openMenu() {
    this.menuOpen = true;
    this.closeDropdown();
  }

  private closeMenu() {
    this.menuOpen = false;
    this.closeDropdown();
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

  private renderSignedInCompactAuth(onNavigate?: () => void) {
    const manageAccountLabel = this.getManageAccountLabel();

    return (
      <a
        class="icon-button manage-account-link"
        href={SIGNED_IN_HEADER.manageAccount.href}
        aria-label={manageAccountLabel}
        onClick={() => onNavigate?.()}
      >
        <SignInIcon />
        <span class="sr-only">{manageAccountLabel}</span>
      </a>
    );
  }

  private renderNavAuthItems(onNavigate?: () => void) {
    if (this.signedIn) {
      const manageAccountLabel = this.getManageAccountLabel();
      const signOut = SIGNED_IN_HEADER.signOut;

      return [
        <li class="main-nav__item main-nav__item--auth" key="manage-account">
          <a
            class="sign-in-link manage-account-link"
            href={SIGNED_IN_HEADER.manageAccount.href}
            aria-label={manageAccountLabel}
            onClick={() => onNavigate?.()}
          >
            <SignInIcon />
            {manageAccountLabel}
          </a>
        </li>,
        <li class="main-nav__item main-nav__item--auth" key="sign-out">
          <a
            class="sign-in-link sign-out-link"
            href={signOut.href}
            aria-label={signOut.label}
            onClick={(event) => this.handleAuthClick(event, onNavigate)}
          >
            <SignOutIcon />
            {signOut.label}
          </a>
        </li>,
      ];
    }

    const auth = this.getAuthControl();
    if (!auth) return null;

    return (
      <li class="main-nav__item main-nav__item--auth" key="sign-in">
        {this.renderAuthControl({ onNavigate })}
      </li>
    );
  }

  private renderNav(onNavigate?: () => void) {
    const { dropdowns, links } = this.getActiveHeaderData();

    return (
      <nav class="main-nav" aria-label="Main">
        <ul class="main-nav__list">
          {dropdowns.map((dropdown) => {
            const isOpen = this.openDropdown === dropdown.label;
            const panelId = this.getDropdownPanelId(dropdown.label);
            return (
              <li
                class="main-nav__item main-nav__item--dropdown"
                key={dropdown.label}
                onMouseEnter={() => this.handleDropdownPointerEnter(dropdown.label)}
                onMouseLeave={() => this.handleDropdownPointerLeave()}
                onFocusin={() => this.handleDropdownFocusIn(dropdown.label)}
                onFocusout={(event) => this.handleDropdownFocusOut(event, dropdown.label)}
              >
                <button
                  type="button"
                  class={{
                    'nav-dropdown__trigger': true,
                    'nav-dropdown__trigger--open': isOpen,
                  }}
                  aria-expanded={isOpen ? 'true' : 'false'}
                  aria-haspopup="true"
                  aria-controls={panelId}
                  id={`${panelId}-trigger`}
                  onClick={(event) => {
                    event.stopPropagation();
                    this.toggleDropdown(dropdown.label);
                  }}
                  onKeyDown={(event) => {
                    const itemEl = (event.currentTarget as HTMLElement).closest(
                      '.main-nav__item--dropdown',
                    ) as HTMLElement;
                    this.handleDropdownTriggerKeyDown(event, dropdown.label, itemEl);
                  }}
                >
                  <span class="nav-dropdown__label">{dropdown.label}</span>
                  <ToggleIcon expanded={isOpen} />
                </button>
                {isOpen ? (
                  <div
                    class="nav-dropdown__panel"
                    id={panelId}
                    role="region"
                    aria-labelledby={`${panelId}-trigger`}
                  >
                    <div class="nav-dropdown__accent">
                      <div class="nav-dropdown__links">
                        {dropdown.items.map((item) => (
                          <a
                            class="nav-dropdown__link"
                            href={item.href}
                            key={`${dropdown.label}:${item.label}`}
                            onClick={() => onNavigate?.()}
                          >
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
            <li class="main-nav__item" key={link.label}>
              <a class="nav-link" href={link.href} onClick={() => onNavigate?.()}>
                {link.label}
              </a>
            </li>
          ))}
          {this.renderNavAuthItems(onNavigate)}
        </ul>
      </nav>
    );
  }

  private renderCompactAuth(onNavigate?: () => void) {
    if (this.signedIn) {
      return this.renderSignedInCompactAuth(onNavigate);
    }
    return this.renderAuthControl({ iconOnly: true, onNavigate });
  }

  render() {
    const logoHref = this.getLogoHref();
    const closeMenu = () => this.closeMenu();

    const mobileMenuActive = this.isMobileMenuActive();

    return (
      <header
        class={{
          header: true,
          'header--menu-open': mobileMenuActive,
        }}
      >
        <div class="container header-inner">
          <button
            type="button"
            class="menu-toggle icon-button"
            aria-label={mobileMenuActive ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileMenuActive ? 'true' : 'false'}
            aria-controls="weg-header-main-nav"
            onClick={() => this.toggleMenu()}
          >
            {mobileMenuActive ? <CloseIcon /> : <HamburgerIcon />}
          </button>
          <Logo href={logoHref} />
          <div class="header-actions">{this.renderCompactAuth(mobileMenuActive ? closeMenu : undefined)}</div>
          <div
            class="main-nav-panel"
            id="weg-header-main-nav"
            role={mobileMenuActive ? 'dialog' : undefined}
            aria-modal={mobileMenuActive ? 'true' : undefined}
            aria-label={mobileMenuActive ? 'Menu' : undefined}
          >
            {this.renderNav(mobileMenuActive ? closeMenu : undefined)}
          </div>
        </div>
      </header>
    );
  }
}
