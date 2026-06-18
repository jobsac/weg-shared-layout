import { Component, Prop, State, Watch, Element, Event, EventEmitter, h, Listen } from '@stencil/core';
import type { LayoutData, LayoutHeaderAuthAction, LayoutLink } from '../../types/layout-data';
import {
  findAuthMenuLink,
  isMenuGroup,
  isNonEmptyString,
  normalizeHeaderMenu,
  parseJsonProp,
} from '../../utils/layout';
import { WEG_HOVER_CAPABLE_MEDIA_QUERY, WEG_MD_MEDIA_QUERY } from '../../constants/breakpoints';
import {
  isAriaCurrentNavHref,
  isNavLinkActive,
  resolveAriaCurrentNavKey,
  type NavActiveMode,
} from '../../utils/nav-active';
import { LOGO_SRC } from './logo-data';

const WEG_HOME = 'https://www.warwickemploymentgroup.com';
const DEFAULT_ACCOUNT_HOME = 'https://account.warwickemploymentgroup.com';
/** Stay visible while scrolling down through the first half of the viewport. */
const HEADER_SCROLL_HIDE_THRESHOLD_VH = 0.5;
const HEADER_SCROLL_DIRECTION_DELTA = 5;

const DEFAULT_LOGO_HREF = `${WEG_HOME}/`;
/** Placeholder href — sign-out is handled via `wegAuthClick`, not navigation. */
const SIGN_OUT_HREF = '#';

function normalizeAccountBase(input?: string): string {
  const base = input?.trim() || DEFAULT_ACCOUNT_HOME;
  return base.replace(/\/$/, '');
}

function accountPath(accountHome: string, path: string): string {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${normalizeAccountBase(accountHome)}${normalizedPath}`;
}

function buildSignedInMenu(accountHome: string): LayoutLink[] {
  return [
    { label: 'Find a job', href: `${WEG_HOME}/find-a-job` },
    { label: 'Dashboard', href: accountPath(accountHome, '/dashboard') },
    { label: 'Manage Account', href: accountPath(accountHome, '/account/manage') },
    { label: 'Sign out', href: SIGN_OUT_HREF },
  ];
}

type HeaderData = {
  logoSrc?: string;
  logoHref?: string;
  menu: LayoutLink[];
};

const EMPTY_HEADER: HeaderData = {
  menu: [],
};

function isSignInLink(link: LayoutLink, accountHome: string): boolean {
  if (link.authAction === 'sign-in') return true;
  if (link.authAction === 'sign-out') return false;
  const label = link.label.trim().toLowerCase();
  if (label === 'sign out') return false;
  if (label === 'sign in') return true;
  return link.href === accountPath(accountHome, '/account/login');
}

function isSignOutLink(link: LayoutLink): boolean {
  if (link.authAction === 'sign-out') return true;
  return link.label.trim().toLowerCase() === 'sign out';
}

function isManageAccountLink(link: LayoutLink, accountHome: string): boolean {
  if (link.label.trim().toLowerCase() === 'manage account') return true;
  return link.href === accountPath(accountHome, '/account/manage');
}

function isFindJobLink(link: LayoutLink): boolean {
  if (link.label.trim().toLowerCase() === 'find a job') return true;
  return link.href === `${WEG_HOME}/find-a-job`;
}

function isDashboardLink(link: LayoutLink, accountHome: string): boolean {
  if (link.label.trim().toLowerCase() === 'dashboard') return true;
  return link.href === accountPath(accountHome, '/dashboard');
}

function normalizeHeaderData(input: unknown): HeaderData {
  const root = (input && typeof input === 'object' ? input : {}) as LayoutData;
  const header = root.header && typeof root.header === 'object' ? root.header : {};
  const logoSrc = isNonEmptyString(header.logoSrc) ? header.logoSrc.trim() : undefined;
  const logoHref = isNonEmptyString(header.logoHref) ? header.logoHref.trim() : undefined;

  return {
    logoSrc,
    logoHref,
    menu: normalizeHeaderMenu(header.menu),
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

function FindJobIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false" fill="none">
      <path
        d="M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <rect
        x="2"
        y="6"
        width="20"
        height="14"
        rx="2"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
  );
}

function DashboardIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false" fill="none">
      <rect
        x="3"
        y="3"
        width="7"
        height="9"
        rx="1"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <rect
        x="14"
        y="3"
        width="7"
        height="5"
        rx="1"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <rect
        x="14"
        y="12"
        width="7"
        height="9"
        rx="1"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <rect
        x="3"
        y="16"
        width="7"
        height="5"
        rx="1"
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

function Logo({ href, src }: { href: string; src: string }) {
  return (
    <a class="logo-link" href={href} aria-label="Home">
      <img class="logo" src={src} alt="Warwick Employment Group logo" width="225" height="83" />
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
   *     "menu": [
   *       { "label": "Find a job", "items": [{ "label": "Graduates", "href": "..." }] },
   *       { "label": "Career advice", "href": "/career-advice" },
   *       { "label": "Sign in", "href": "/account/login" }
   *     ]
   *   }
   * }
   * ```
   */
  @Prop() layout?: LayoutData | string;

  /**
   * When true, the header uses the built-in signed-in menu instead of the CMS layout.
   */
  @Prop({ attribute: 'signed-in', reflect: true }) signedIn = false;

  /**
   * Signed-in user's first name, shown beside the profile icon on Manage Account.
   */
  @Prop({ attribute: 'user-name' }) userName?: string;

  /**
   * Account portal origin for sign-in, register, dashboard, and manage-account links.
   * Defaults to production when omitted.
   */
  @Prop({ attribute: 'account-base-url' }) accountBaseUrl?: string;

  /**
   * Current page path from the host application (e.g. `/career-advice/my-article`).
   * Include a query string when matching dropdown links that use search params.
   */
  @Prop({ attribute: 'current-path' }) currentPath?: string;

  /**
   * Fired when the user clicks Sign in or Sign out.
   * Call `event.preventDefault()` in the host to handle navigation/logout yourself.
   */
  @Event({ eventName: 'wegAuthClick' }) wegAuthClick!: EventEmitter<{ action: LayoutHeaderAuthAction }>;

  @Element() el!: HTMLElement;

  @State() private resolved: HeaderData = EMPTY_HEADER;
  @State() private menuOpen = false;
  @State() private openDropdown: string | null = null;
  @State() private headerHidden = false;

  private boundHandleDocumentClick = this.handleDocumentClick.bind(this);
  private boundHandleViewportChange = this.handleViewportChange.bind(this);
  private boundHandleHoverCapabilityChange = this.handleHoverCapabilityChange.bind(this);
  private boundHandleScroll = this.handleScroll.bind(this);
  private headerResizeObserver?: ResizeObserver;
  private lastScrollY = 0;
  private scrollTicking = false;
  private hoverCloseTimer: ReturnType<typeof setTimeout> | null = null;
  private hoverOpenEnabled = false;
  private desktopMediaQuery?: MediaQueryList;
  private hoverCapableMediaQuery?: MediaQueryList;

  private resolve() {
    if (this.layout === undefined || this.layout === null) {
      this.resolved = EMPTY_HEADER;
      return;
    }
    this.resolved = normalizeHeaderData(parseJsonProp(this.layout));
  }

  componentWillLoad() {
    this.resolve();
    this.hoverCapableMediaQuery = window.matchMedia(WEG_HOVER_CAPABLE_MEDIA_QUERY);
    this.hoverCapableMediaQuery.addEventListener('change', this.boundHandleHoverCapabilityChange);
    this.desktopMediaQuery = window.matchMedia(WEG_MD_MEDIA_QUERY);
    this.desktopMediaQuery.addEventListener('change', this.boundHandleViewportChange);
    this.updateHoverDropdownEnabled();
    this.handleViewportChange();
  }

  componentDidLoad() {
    const header = this.el.shadowRoot?.querySelector('.header');
    if (!header) return;

    this.headerResizeObserver = new ResizeObserver(() => this.syncHeaderHeight());
    this.headerResizeObserver.observe(header);
    this.syncHeaderHeight();
    this.lastScrollY = window.scrollY;
    this.updateHeaderVisibility();
  }

  connectedCallback() {
    document.addEventListener('click', this.boundHandleDocumentClick);
    window.addEventListener('scroll', this.boundHandleScroll, { passive: true });
  }

  disconnectedCallback() {
    document.removeEventListener('click', this.boundHandleDocumentClick);
    window.removeEventListener('scroll', this.boundHandleScroll);
    this.headerResizeObserver?.disconnect();
    this.desktopMediaQuery?.removeEventListener('change', this.boundHandleViewportChange);
    this.hoverCapableMediaQuery?.removeEventListener('change', this.boundHandleHoverCapabilityChange);
    this.cancelScheduledDropdownClose();
  }

  private syncHeaderHeight() {
    if (this.isMobileMenuActive()) return;

    const header = this.el.shadowRoot?.querySelector('.header') as HTMLElement | null;
    if (!header) return;

    this.el.style.setProperty('--weg-header-height', `${header.offsetHeight}px`);
  }

  private handleScroll() {
    if (this.scrollTicking) return;

    this.scrollTicking = true;
    requestAnimationFrame(() => {
      this.scrollTicking = false;
      this.updateHeaderVisibility();
    });
  }

  private updateHeaderVisibility() {
    if (this.isMobileMenuActive()) {
      if (this.headerHidden) this.headerHidden = false;
      return;
    }

    const scrollY = window.scrollY;
    const delta = scrollY - this.lastScrollY;
    const threshold = window.innerHeight * HEADER_SCROLL_HIDE_THRESHOLD_VH;
    let nextHidden = this.headerHidden;

    if (scrollY <= threshold) {
      nextHidden = false;
    } else if (Math.abs(delta) >= HEADER_SCROLL_DIRECTION_DELTA) {
      nextHidden = delta > 0;
    }

    this.lastScrollY = scrollY;

    if (nextHidden === this.headerHidden) return;

    if (nextHidden) this.closeDropdown();
    this.headerHidden = nextHidden;
  }

  /**
   * Desktop dropdowns open on hover when viewport is md+ and the device reports hover support.
   * Uses (hover: hover) only — not (pointer: fine), which breaks in DevTools and hybrid devices.
   */
  private updateHoverDropdownEnabled() {
    const enabled = Boolean(
      this.desktopMediaQuery?.matches && this.hoverCapableMediaQuery?.matches,
    );
    if (this.hoverOpenEnabled && !enabled) {
      this.cancelScheduledDropdownClose();
      this.closeDropdown();
    }
    this.hoverOpenEnabled = enabled;
  }

  private handleHoverCapabilityChange() {
    this.updateHoverDropdownEnabled();
  }

  private handleViewportChange() {
    if (this.desktopMediaQuery?.matches) {
      this.closeMenu();
    }
    this.updateHoverDropdownEnabled();
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

    if (this.openDropdown) {
      event.preventDefault();
      this.closeDropdownAndFocusTrigger(this.openDropdown);
      return;
    }

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

  private handleDropdownPointerLeave(event: MouseEvent) {
    if (!this.hoverOpenEnabled) return;
    const related = event.relatedTarget as Node | null;
    const container = event.currentTarget as HTMLElement;
    if (related && container.contains(related)) return;
    this.scheduleDropdownClose();
  }

  private handleDropdownPanelPointerEnter(label: string) {
    if (!this.hoverOpenEnabled) return;
    this.cancelScheduledDropdownClose();
    this.openDropdownMenu(label);
  }

  private handleDropdownPanelPointerLeave(event: MouseEvent) {
    if (!this.hoverOpenEnabled) return;
    const related = event.relatedTarget as Node | null;
    const panel = event.currentTarget as HTMLElement;
    const container = panel.closest('.nav-dropdown');
    if (related && container?.contains(related)) return;
    this.scheduleDropdownClose();
  }

  private handleDropdownTriggerClick(event: MouseEvent, label: string) {
    event.stopPropagation();
    this.cancelScheduledDropdownClose();
    this.toggleDropdown(label);
  }

  private handleDropdownFocusOut(event: FocusEvent, label: string) {
    const related = event.relatedTarget as Node | null;
    const container = event.currentTarget as HTMLElement;
    if (related && container.contains(related)) return;
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

  private getDropdownLinks(container: HTMLElement): HTMLAnchorElement[] {
    return Array.from(container.querySelectorAll('.nav-dropdown__link'));
  }

  private focusDropdownLink(container: HTMLElement, index: number) {
    setTimeout(() => {
      const links = this.getDropdownLinks(container);
      links[index]?.focus();
    }, 0);
  }

  private focusFirstDropdownLink(itemEl: HTMLElement) {
    this.focusDropdownLink(itemEl, 0);
  }

  private getDropdownContainer(label: string): HTMLElement | null {
    const panelId = this.getDropdownPanelId(label);
    return this.el.shadowRoot?.querySelector(`#${panelId}-trigger`)?.closest('.nav-dropdown') ?? null;
  }

  private closeDropdownAndFocusTrigger(labelOrContainer: string | HTMLElement) {
    const container =
      typeof labelOrContainer === 'string'
        ? this.getDropdownContainer(labelOrContainer)
        : labelOrContainer;
    const trigger = container?.querySelector('.nav-dropdown__trigger') as HTMLButtonElement | null;
    this.closeDropdown();
    setTimeout(() => trigger?.focus(), 0);
  }

  private handleDropdownLinkKeyDown(event: KeyboardEvent, container: HTMLElement) {
    const links = this.getDropdownLinks(container);
    const currentIndex = links.indexOf(event.currentTarget as HTMLAnchorElement);
    if (currentIndex === -1) return;

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      links[(currentIndex + 1) % links.length]?.focus();
      return;
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      links[(currentIndex - 1 + links.length) % links.length]?.focus();
      return;
    }

    if (event.key === 'Escape') {
      event.preventDefault();
      event.stopPropagation();
      this.closeDropdownAndFocusTrigger(container);
    }
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
    this.headerHidden = false;
    this.closeDropdown();
  }

  private closeMenu() {
    this.menuOpen = false;
    this.closeDropdown();
    this.syncHeaderHeight();
    this.updateHeaderVisibility();
  }

  private getAccountHome(): string {
    return normalizeAccountBase(this.accountBaseUrl);
  }

  private getActiveMenu(): LayoutLink[] {
    return this.signedIn ? buildSignedInMenu(this.getAccountHome()) : this.resolved.menu;
  }

  private getLogoSrc(): string {
    return this.resolved.logoSrc ?? LOGO_SRC;
  }

  private getLogoHref(): string {
    return this.resolved.logoHref ?? DEFAULT_LOGO_HREF;
  }

  private findSignInLink(menu: LayoutLink[]): LayoutLink | null {
    const byAction = findAuthMenuLink(menu, 'sign-in');
    if (byAction) return byAction;

    const accountHome = this.getAccountHome();
    for (const item of menu) {
      if (!isMenuGroup(item) && isSignInLink(item, accountHome)) return item;
    }
    return null;
  }

  private getManageAccountLabel(): string {
    const name = this.userName?.trim();
    return name || 'Manage Account';
  }

  private shouldExcludeFromNavActive(item: LayoutLink, accountHome: string): boolean {
    return isSignOutLink(item) || isSignInLink(item, accountHome);
  }

  private isNavItemActive(href: string | undefined, mode: NavActiveMode): boolean {
    return isNavLinkActive(this.currentPath ?? '', href, mode);
  }

  private resolveAriaCurrentHref(): string | null {
    const accountHome = this.getAccountHome();

    return resolveAriaCurrentNavKey(this.getActiveMenu(), this.currentPath ?? '', (item) =>
      this.shouldExcludeFromNavActive(item as LayoutLink, accountHome),
    );
  }

  private isAriaCurrentHref(href: string | undefined, ariaCurrentKey: string | null): boolean {
    return isAriaCurrentNavHref(href, ariaCurrentKey);
  }

  private renderIconNavLink(
    link: LayoutLink,
    Icon: () => unknown,
    className: string,
    onNavigate?: () => void,
    ariaCurrentHref: string | null = null,
  ) {
    const active = this.isNavItemActive(link.href, 'prefix');
    const ariaCurrent = this.isAriaCurrentHref(link.href, ariaCurrentHref);

    return (
      <li class="main-nav__item main-nav__item--auth" key={link.label}>
        <a
          class={{
            'sign-in-link': true,
            [className]: true,
            'nav-link--active': active,
          }}
          href={link.href}
          aria-current={ariaCurrent ? 'page' : undefined}
          onClick={() => onNavigate?.()}
        >
          <Icon />
          {link.label}
        </a>
      </li>
    );
  }

  private renderFlatNavLink(
    link: LayoutLink,
    onNavigate?: () => void,
    ariaCurrentHref: string | null = null,
  ) {
    const active = this.isNavItemActive(link.href, 'prefix');
    const ariaCurrent = this.isAriaCurrentHref(link.href, ariaCurrentHref);

    return (
      <li class="main-nav__item" key={link.label}>
        <a
          class={{
            'nav-link': true,
            'nav-link--active': active,
          }}
          href={link.href}
          aria-current={ariaCurrent ? 'page' : undefined}
          onClick={() => onNavigate?.()}
        >
          {link.label}
        </a>
      </li>
    );
  }

  private renderMenuGroup(
    item: LayoutLink,
    onNavigate?: () => void,
    ariaCurrentHref: string | null = null,
  ) {
    const items = item.items ?? [];
    const isOpen = this.openDropdown === item.label;
    const panelId = this.getDropdownPanelId(item.label);
    const groupActive = items.some((child) => this.isNavItemActive(child.href, 'exact'));

    return (
      <li class="main-nav__item main-nav__item--dropdown" key={item.label}>
        <div
          class="nav-dropdown"
          onMouseEnter={() => this.handleDropdownPointerEnter(item.label)}
          onMouseLeave={(event) => this.handleDropdownPointerLeave(event)}
          onFocusout={(event) => this.handleDropdownFocusOut(event, item.label)}
        >
          <button
            type="button"
            class={{
              'nav-dropdown__trigger': true,
              'nav-dropdown__trigger--open': isOpen,
              'nav-dropdown__trigger--active': groupActive,
            }}
            aria-expanded={isOpen ? 'true' : 'false'}
            aria-haspopup="true"
            aria-controls={panelId}
            id={`${panelId}-trigger`}
            onClick={(event) => this.handleDropdownTriggerClick(event, item.label)}
            onKeyDown={(event) => {
              const container = (event.currentTarget as HTMLElement).closest('.nav-dropdown') as HTMLElement;
              this.handleDropdownTriggerKeyDown(event, item.label, container);
            }}
          >
            <span class="nav-dropdown__label">{item.label}</span>
            <ToggleIcon expanded={isOpen} />
          </button>
          {isOpen ? (
            <div
              class="nav-dropdown__panel"
              id={panelId}
              role="region"
              aria-labelledby={`${panelId}-trigger`}
              onMouseEnter={() => this.handleDropdownPanelPointerEnter(item.label)}
              onMouseLeave={(event) => this.handleDropdownPanelPointerLeave(event)}
            >
              <div class="nav-dropdown__accent">
                <div class="nav-dropdown__links">
                  {items.map((child) => {
                    const childActive = this.isNavItemActive(child.href, 'exact');
                    const ariaCurrent = this.isAriaCurrentHref(child.href, ariaCurrentHref);

                    return (
                      <a
                        class={{
                          'nav-dropdown__link': true,
                          'nav-dropdown__link--active': childActive,
                        }}
                        href={child.href}
                        key={`${item.label}:${child.label}`}
                        aria-current={ariaCurrent ? 'page' : undefined}
                        onClick={() => onNavigate?.()}
                        onKeyDown={(event) => {
                          const dropdownContainer = (event.currentTarget as HTMLElement).closest(
                            '.nav-dropdown',
                          ) as HTMLElement;
                          this.handleDropdownLinkKeyDown(event, dropdownContainer);
                        }}
                      >
                        {child.label}
                      </a>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </li>
    );
  }

  private handleAuthClick(
    event: MouseEvent,
    action: LayoutHeaderAuthAction,
    _href: string | undefined,
    onNavigate?: () => void,
  ) {
    const emitted = this.wegAuthClick.emit({ action });

    if (emitted.defaultPrevented) {
      event.preventDefault();
      onNavigate?.();
      return;
    }

    if (action === 'sign-out') {
      event.preventDefault();
      onNavigate?.();
      return;
    }

    onNavigate?.();
  }

  private renderAuthControl(options: {
    link: LayoutLink;
    action: LayoutHeaderAuthAction;
    iconOnly?: boolean;
    className?: string;
    onNavigate?: () => void;
  }) {
    const { link, action, iconOnly, onNavigate } = options;
    const Icon = action === 'sign-out' ? SignOutIcon : SignInIcon;
    const classSuffix = action === 'sign-out' ? 'sign-out-link' : 'sign-in-link';

    return (
      <a
        class={{
          [classSuffix]: !iconOnly,
          'icon-button': !!iconOnly,
          [options.className || '']: !!options.className,
        }}
        href={link.href}
        aria-label={link.label}
        onClick={(event) => this.handleAuthClick(event, action, link.href, onNavigate)}
      >
        <Icon />
        {!iconOnly ? link.label : null}
        {iconOnly ? <span class="sr-only">{link.label}</span> : null}
      </a>
    );
  }

  private renderManageAccountAnchor(
    onNavigate?: () => void,
    iconOnly = false,
    ariaCurrentHref: string | null = null,
  ) {
    const label = this.getManageAccountLabel();
    const href = accountPath(this.getAccountHome(), '/account/manage');
    const active = this.isNavItemActive(href, 'prefix');
    const ariaCurrent = this.isAriaCurrentHref(href, ariaCurrentHref);

    return (
      <a
        class={{
          'sign-in-link': !iconOnly,
          'manage-account-link': true,
          'icon-button': iconOnly,
          'nav-link--active': active,
        }}
        href={href}
        aria-label={label}
        aria-current={ariaCurrent ? 'page' : undefined}
        onClick={() => onNavigate?.()}
      >
        <SignInIcon />
        {!iconOnly ? label : null}
        {iconOnly ? <span class="sr-only">{label}</span> : null}
      </a>
    );
  }

  private renderNavItem(item: LayoutLink, onNavigate?: () => void, ariaCurrentHref: string | null = null) {
    const accountHome = this.getAccountHome();

    if (isMenuGroup(item)) {
      return this.renderMenuGroup(item, onNavigate, ariaCurrentHref);
    }

    if (isSignOutLink(item)) {
      return (
        <li class="main-nav__item main-nav__item--auth" key="sign-out">
          {this.renderAuthControl({ link: item, action: 'sign-out', onNavigate })}
        </li>
      );
    }

    if (isSignInLink(item, accountHome)) {
      return (
        <li class="main-nav__item main-nav__item--auth" key="sign-in">
          {this.renderAuthControl({ link: item, action: 'sign-in', onNavigate })}
        </li>
      );
    }

    if (isManageAccountLink(item, accountHome)) {
      return (
        <li class="main-nav__item main-nav__item--auth" key="manage-account">
          {this.renderManageAccountAnchor(onNavigate, false, ariaCurrentHref)}
        </li>
      );
    }

    if (this.signedIn && isFindJobLink(item)) {
      return this.renderIconNavLink(item, FindJobIcon, 'find-a-job-link', onNavigate, ariaCurrentHref);
    }

    if (this.signedIn && isDashboardLink(item, accountHome)) {
      return this.renderIconNavLink(item, DashboardIcon, 'dashboard-link', onNavigate, ariaCurrentHref);
    }

    return this.renderFlatNavLink(item, onNavigate, ariaCurrentHref);
  }

  private renderNav(onNavigate?: () => void) {
    const ariaCurrentHref = this.resolveAriaCurrentHref();

    return (
      <nav class="main-nav" aria-label="Main">
        <ul class="main-nav__list">
          {this.getActiveMenu().map((item) => this.renderNavItem(item, onNavigate, ariaCurrentHref))}
        </ul>
      </nav>
    );
  }

  private renderCompactAuth(onNavigate?: () => void) {
    if (this.signedIn) {
      return this.renderManageAccountAnchor(onNavigate, true);
    }

    const signIn = this.findSignInLink(this.resolved.menu);
    if (!signIn?.href) return null;

    return this.renderAuthControl({
      link: signIn,
      action: 'sign-in',
      iconOnly: true,
      onNavigate,
    });
  }

  render() {
    const logoHref = this.getLogoHref();
    const logoSrc = this.getLogoSrc();
    const closeMenu = () => this.closeMenu();

    const mobileMenuActive = this.isMobileMenuActive();

    return (
      <header
        class={{
          header: true,
          'header--fixed': !mobileMenuActive,
          'header--hidden': this.headerHidden && !mobileMenuActive,
          'header--menu-open': mobileMenuActive,
        }}
      >
        <div class="header-inner">
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
          <Logo href={logoHref} src={logoSrc} />
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
