import { Component, Prop, State, Watch, h } from '@stencil/core';

type FooterVariant = 'standard' | 'additional';

type FooterLink = {
  label: string;
  href: string;
};

type FooterLinkGroup = {
  id: string;
  links: FooterLink[];
};

type FooterSocialPlatform = 'LinkedIn' | 'Instagram' | 'TikTok' | 'YouTube';

type FooterSocialLink = {
  platform: FooterSocialPlatform;
  href: string;
};

function parseJsonProp<T>(value?: string): T | undefined {
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  try {
    return JSON.parse(trimmed) as T;
  } catch {
    return undefined;
  }
}

function isExternalHref(href: string) {
  return /^https?:\/\//.test(href);
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function isValidSocialPlatform(value: unknown): value is FooterSocialPlatform {
  return value === 'LinkedIn' || value === 'Instagram' || value === 'TikTok' || value === 'YouTube';
}

function normalizeSocialLinks(input: unknown): FooterSocialLink[] {
  if (!Array.isArray(input)) return [];
  const result: FooterSocialLink[] = [];
  for (const item of input) {
    if (!item || typeof item !== 'object') continue;
    const platform = (item as { platform?: unknown }).platform;
    const href = (item as { href?: unknown }).href;
    if (!isValidSocialPlatform(platform)) continue;
    if (!isNonEmptyString(href)) continue;
    result.push({ platform, href: href.trim() });
  }
  return result;
}

function normalizeLinks(input: unknown): FooterLink[] {
  if (!Array.isArray(input)) return [];
  const result: FooterLink[] = [];
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

function normalizeGroups(input: unknown): FooterLinkGroup[] {
  if (!Array.isArray(input)) return [];
  const result: FooterLinkGroup[] = [];
  for (const item of input) {
    if (!item || typeof item !== 'object') continue;
    const id = (item as { id?: unknown }).id;
    const links = normalizeLinks((item as { links?: unknown }).links);
    if (!isNonEmptyString(id)) continue;
    if (links.length === 0) continue;
    result.push({ id: id.trim(), links });
  }
  return result;
}

function SocialIcon({ platform }: { platform: FooterSocialPlatform }) {
  // Inline SVGs keep the component framework-agnostic and avoid additional bundling concerns.
  const common = {
    viewBox: '0 0 48 48',
    width: 48,
    height: 48,
    fill: 'none',
    xmlns: 'http://www.w3.org/2000/svg',
    'aria-hidden': 'true',
    focusable: 'false',
  } as const;

  switch (platform) {
    case 'LinkedIn':
      return (
        <svg {...common}>
          <path
            d="M24 0C37.2548 0 48 10.7452 48 24C48 37.2548 37.2548 48 24 48C10.7452 48 0 37.2548 0 24C0 10.7452 10.7452 0 24 0ZM12.9082 33.4736H17.5889V19.4111H12.9082V33.4736ZM29.0791 19.0811C26.5942 19.0811 25.4815 20.4458 24.8604 21.4033V19.4111H20.1797C20.2412 20.7279 20.1799 33.4203 20.1797 33.4736H24.8604V25.6201C24.8604 25.1998 24.8909 24.7804 25.0146 24.4795C25.3529 23.6399 26.1231 22.7705 27.416 22.7705C29.1103 22.7705 29.7881 24.0605 29.7881 25.9502V33.4736H34.4678V25.4102C34.4677 21.0909 32.1589 19.0811 29.0791 19.0811ZM15.2793 12.6318C13.6783 12.6319 12.6319 13.6818 12.6318 15.0605C12.6318 16.4108 13.6474 17.4912 15.2188 17.4912H15.249C16.8807 17.491 17.8965 16.4107 17.8965 15.0605C17.866 13.6818 16.8804 12.6318 15.2793 12.6318Z"
            fill="white"
          />
        </svg>
      );
    case 'Instagram':
      return (
        <svg {...common}>
          <path
            d="M24 0C37.2548 0 48 10.7452 48 24C48 37.2548 37.2548 48 24 48C10.7452 48 0 37.2548 0 24C0 10.7452 10.7452 0 24 0ZM23.999 11.2002C20.5245 11.2002 20.0877 11.2152 18.7227 11.2773C17.3602 11.3398 16.43 11.5556 15.6162 11.8721C14.7744 12.199 14.06 12.636 13.3486 13.3477C12.6366 14.0591 12.1991 14.7736 11.8711 15.6152C11.5538 16.4293 11.3377 17.3597 11.2764 18.7217C11.2153 20.087 11.2002 20.5238 11.2002 24C11.2002 27.476 11.2155 27.9113 11.2773 29.2764C11.34 30.639 11.5558 31.5699 11.8721 32.3838C12.1993 33.2255 12.636 33.94 13.3477 34.6514C14.0589 35.3634 14.7739 35.801 15.6152 36.1279C16.4295 36.4444 17.3596 36.6602 18.7217 36.7227C20.087 36.7848 20.5233 36.7998 23.999 36.7998C27.4756 36.7998 27.911 36.7848 29.2764 36.7227C30.639 36.6602 31.5704 36.4445 32.3848 36.1279C33.2261 35.801 33.9394 35.3631 34.6504 34.6514C35.3624 33.9399 35.7999 33.2254 36.1279 32.3838C36.4426 31.5697 36.6586 30.6393 36.7227 29.2773C36.784 27.912 36.7998 27.4763 36.7998 24C36.7998 20.5242 36.784 20.0876 36.7227 18.7227C36.6587 17.36 36.4426 16.4291 36.1279 15.6152C35.7999 14.7734 35.3623 14.0591 34.6504 13.3477C33.9385 12.6358 33.2264 12.1987 32.3838 11.8721C31.5678 11.5555 30.6371 11.3397 29.2744 11.2773C27.9093 11.2152 27.4745 11.2002 23.999 11.2002Z"
            fill="white"
          />
          <path
            d="M22.8525 13.5068C23.1933 13.5063 23.5739 13.5068 24.001 13.5068C27.4186 13.5068 27.8242 13.5197 29.1738 13.5811C30.4214 13.6381 31.0986 13.8463 31.5498 14.0215C32.1471 14.2535 32.5737 14.5305 33.0215 14.9785C33.4695 15.4265 33.746 15.8538 33.9785 16.4512C34.1537 16.9018 34.3631 17.5792 34.4199 18.8271C34.4812 20.1763 34.4941 20.5822 34.4941 23.998C34.4941 27.4134 34.4812 27.819 34.4199 29.168C34.3629 30.4158 34.1537 31.0933 33.9785 31.5439C33.7466 32.1412 33.4693 32.567 33.0215 33.0146C32.5735 33.4627 32.1474 33.7397 31.5498 33.9717C31.0992 34.1477 30.4216 34.356 29.1738 34.4131C27.8245 34.4744 27.4186 34.4883 24.001 34.4883C20.5835 34.4883 20.1783 34.4744 18.8291 34.4131C17.5811 34.3555 16.9036 34.1469 16.4521 33.9717C15.8549 33.7397 15.4284 33.4625 14.9805 33.0146C14.5325 32.5666 14.255 32.1406 14.0225 31.543C13.8473 31.0923 13.6378 30.4148 13.5811 29.167C13.5197 27.8179 13.5078 27.4121 13.5078 23.9941C13.5078 20.5762 13.5197 20.1726 13.5811 18.8232C13.6381 17.5755 13.8473 16.8984 14.0225 16.4473C14.2545 15.8499 14.5325 15.4236 14.9805 14.9756C15.4285 14.5276 15.8549 14.2501 16.4521 14.0176C16.9034 13.8416 17.5811 13.6335 18.8291 13.5762C20.0097 13.5228 20.4674 13.5066 22.8525 13.5039V13.5068ZM24.001 17.4268C20.371 17.427 17.4277 20.3709 17.4277 24.001C17.4279 27.6309 20.3711 30.5721 24.001 30.5723C27.631 30.5723 30.573 27.631 30.5732 24.001C30.5732 20.3708 27.6311 17.4268 24.001 17.4268ZM30.834 15.6318C29.9861 15.632 29.2979 16.3198 29.2979 17.168C29.2979 18.0159 29.9861 18.704 30.834 18.7041C31.682 18.7041 32.3701 18.016 32.3701 17.168C32.37 16.32 31.6819 15.6318 30.834 15.6318Z"
            fill="white"
          />
          <path
            d="M24.0011 19.7334C26.3574 19.7334 28.2678 21.6436 28.2678 24.0001C28.2678 26.3564 26.3574 28.2668 24.0011 28.2668C21.6445 28.2668 19.7344 26.3564 19.7344 24.0001C19.7344 21.6436 21.6445 19.7334 24.0011 19.7334Z"
            fill="white"
          />
        </svg>
      );
    case 'TikTok':
      return (
        <svg {...common}>
          <path
            d="M24 0C37.2548 0 48 10.7452 48 24C48 37.2548 37.2548 48 24 48C10.7452 48 0 37.2548 0 24C0 10.7452 10.7452 0 24 0ZM25.0273 28.3477C25.0273 30.2955 23.4721 31.8955 21.5361 31.8955C19.6003 31.8954 18.0449 30.2955 18.0449 28.3477C18.045 26.4347 19.5659 24.8693 21.4326 24.7998V20.6953C17.3188 20.7648 14.0001 24.1391 14 28.3477C14 32.5912 17.3883 36 21.5713 36C25.754 35.9998 29.1416 32.5562 29.1416 28.3477V19.9648C30.6627 21.0779 32.5295 21.7396 34.5 21.7744V17.6699C31.4579 17.5656 29.0723 15.0609 29.0723 12H25.0273V28.3477Z"
            fill="white"
          />
        </svg>
      );
    case 'YouTube':
      return (
        <svg {...common}>
          <path
            d="M24 0C37.2548 0 48 10.7452 48 24C48 37.2548 37.2548 48 24 48C10.7452 48 0 37.2548 0 24C0 10.7452 10.7452 0 24 0ZM24 15.2002C24 15.2002 15.9944 15.1997 13.998 15.749C12.8966 16.0513 12.0288 16.9423 11.7344 18.0732C11.1996 20.1231 11.2002 24.4004 11.2002 24.4004C11.2002 24.4472 11.2026 28.6878 11.7344 30.7266C12.0288 31.8575 12.8966 32.7483 13.998 33.0508C15.9944 33.6 24 33.5996 24 33.5996C24 33.5996 32.0057 33.6 34.002 33.0508C35.1033 32.7483 35.9703 31.8575 36.2646 30.7266C36.7966 28.6879 36.7998 24.4472 36.7998 24.4004C36.7998 24.4004 36.7996 20.1231 36.2646 18.0732C35.9703 16.9424 35.1033 16.0513 34.002 15.749C32.0057 15.1997 24 15.2002 24 15.2002Z"
            fill="white"
          />
          <path d="M21.6016 28.7998V20.7998L28.0016 24.8L21.6016 28.7998Z" fill="white" />
        </svg>
      );
  }
}

@Component({
  tag: 'weg-footer',
  styleUrl: 'weg-footer.css',
  shadow: true,
})
export class WegFooter {
  /**
   * `standard` matches the "single group of links" footer.
   * `additional` matches the "multiple link sets" footer.
   */
  @Prop() variant: FooterVariant = 'standard';

  @Prop() companyName = 'WEG';

  @Prop() companyNumber = '';

  /**
   * Optional URL to a JSON file for social links.
   * If provided, this takes precedence over `socialLinks`.
   */
  @Prop() socialLinksSrc?: string;

  /**
   * Social links as a JSON string (for HTML usage).
   * Example:
   * `[{"platform":"LinkedIn","href":"https://..."},{"platform":"X","href":"https://..."}]`
   *
   * Icons render only for items with a non-empty `href`.
   */
  @Prop() socialLinks?: string;

  /**
   * Optional URL to a JSON file for standard links.
   * If provided, this takes precedence over `standardLinks`.
   */
  @Prop() standardLinksSrc?: string;

  /**
   * Standard footer links as a JSON string.
   * Example: `[{"label":"Privacy Policy","href":"/privacy"}]`
   */
  @Prop() standardLinks?: string;

  /**
   * Optional URL to a JSON file for additional groups.
   * If provided, this takes precedence over `additionalGroups`.
   */
  @Prop() additionalGroupsSrc?: string;

  /**
   * Additional footer groups as a JSON string.
   * Example: `[{"id":"set-1","links":[{"label":"Services","href":"/services"}]}]`
   */
  @Prop() additionalGroups?: string;

  @State() private resolvedSocialLinks: FooterSocialLink[] = [];
  @State() private resolvedStandardLinks: FooterLink[] = [];
  @State() private resolvedAdditionalGroups: FooterLinkGroup[] = [];

  private async fetchJson(url: string): Promise<unknown | undefined> {
    const trimmed = url.trim();
    if (!trimmed) return undefined;
    try {
      const res = await fetch(trimmed);
      if (!res.ok) return undefined;
      return (await res.json()) as unknown;
    } catch {
      return undefined;
    }
  }

  private async loadLinksFromProps() {
    const socialFromSrc = isNonEmptyString(this.socialLinksSrc) ? await this.fetchJson(this.socialLinksSrc) : undefined;
    const standardFromSrc = isNonEmptyString(this.standardLinksSrc) ? await this.fetchJson(this.standardLinksSrc) : undefined;
    const additionalFromSrc = isNonEmptyString(this.additionalGroupsSrc) ? await this.fetchJson(this.additionalGroupsSrc) : undefined;

    this.resolvedSocialLinks = normalizeSocialLinks(
      socialFromSrc !== undefined ? socialFromSrc : parseJsonProp<unknown>(this.socialLinks)
    );
    this.resolvedStandardLinks = normalizeLinks(
      standardFromSrc !== undefined ? standardFromSrc : parseJsonProp<unknown>(this.standardLinks)
    );
    this.resolvedAdditionalGroups = normalizeGroups(
      additionalFromSrc !== undefined ? additionalFromSrc : parseJsonProp<unknown>(this.additionalGroups)
    );
  }

  async componentWillLoad() {
    await this.loadLinksFromProps();
  }

  @Watch('socialLinks')
  @Watch('socialLinksSrc')
  @Watch('standardLinks')
  @Watch('standardLinksSrc')
  @Watch('additionalGroups')
  @Watch('additionalGroupsSrc')
  protected async watchLinks() {
    await this.loadLinksFromProps();
  }

  private renderLegalText() {
    return (
      <div class="legal">
        <p class="legal__p">
          Warwick University Enterprises Limited, trading as&nbsp;{this.companyName}, is a limited company registered in England and Wales, Registered
          number: {this.companyNumber || '—'}.
          <br aria-hidden="true" />
          Registered office: University House, Kirby Corner Road, Coventry, West Midlands, CV4 8UW
        </p>
        <p class="legal__p">{String.fromCharCode(8203)}</p>
        <p class="legal__p">Copyright © {this.companyName}.</p>
      </div>
    );
  }

  private renderSocialLinks() {
    const links = this.resolvedSocialLinks;
    if (links.length === 0) return null;
    return (
      <div class="social">
        {links.map((l) => (
          <a
            class="social__link"
            href={l.href}
            aria-label={l.platform}
            target={isExternalHref(l.href) ? '_blank' : undefined}
            rel={isExternalHref(l.href) ? 'noreferrer noopener' : undefined}
          >
            <span class="social__icon" aria-hidden="true">
              <SocialIcon platform={l.platform} />
            </span>
          </a>
        ))}
      </div>
    );
  }

  private renderStandard() {
    const links = this.resolvedStandardLinks;
    return (
      <div class="standard">
        {links.length > 0 ? (
          <div class="standard__links">
            {links.map((l) => (
              <a class="footer-link" href={l.href}>
                {l.label}
              </a>
            ))}
          </div>
        ) : null}
        {this.renderLegalText()}
      </div>
    );
  }

  private renderAdditional() {
    const groups = this.resolvedAdditionalGroups;
    return (
      <div class="additional">
        {groups.length > 0 ? (
          <div class="additional__mobile">
            {groups.map((group, idx) => (
              <div class="additional__mobileGroup">
                <div class="link-list">
                  {group.links.map((l) => (
                    <a class="footer-link footer-link--block" href={l.href}>
                      {l.label}
                    </a>
                  ))}
                </div>
                {idx < groups.length - 1 ? <div class="separator separator--h" /> : null}
              </div>
            ))}
          </div>
        ) : null}

        {groups.length > 0 ? (
          <div class="additional__desktop" role="presentation">
            {groups.map((group, idx) => (
              <div class="additional__desktopGroup">
                <div class="link-list">
                  {group.links.map((l) => (
                    <a class="footer-link footer-link--block" href={l.href}>
                      {l.label}
                    </a>
                  ))}
                </div>
                {idx < groups.length - 1 ? <div class="separator separator--v" /> : null}
              </div>
            ))}
          </div>
        ) : null}

        {this.renderLegalText()}
      </div>
    );
  }

  render() {
    return (
      <footer class="footer">
        <div class="container">
          {this.renderSocialLinks()}
          {this.variant === 'additional' ? this.renderAdditional() : this.renderStandard()}
        </div>
      </footer>
    );
  }
}

