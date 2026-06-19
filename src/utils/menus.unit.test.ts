import { describe, it, expect, vi, afterEach } from 'vitest';
import {
  DEFAULT_WEG21_API_BASE,
  dummyWeg21LayoutData,
  fetchWeg21Layout,
  menusToLayoutData,
  WEG21_BOOTSTRAP_DUMMY,
  WEG21_MENUS_DUMMY,
} from './menus';

describe('menusToLayoutData', () => {
  it('maps ext nav and bootstrap footer fields to LayoutData', () => {
    expect(menusToLayoutData(WEG21_BOOTSTRAP_DUMMY, WEG21_MENUS_DUMMY)).toEqual({
      header: { menu: WEG21_MENUS_DUMMY.header.ext },
      footer: {
        menu: WEG21_MENUS_DUMMY.footer,
        social: WEG21_BOOTSTRAP_DUMMY.footer.social_links,
        credits: WEG21_BOOTSTRAP_DUMMY.footer.credit,
        copyright: WEG21_BOOTSTRAP_DUMMY.footer.copyright,
      },
    });
  });

  it('can map int nav for signed-in jobs apps', () => {
    expect(
      menusToLayoutData(WEG21_BOOTSTRAP_DUMMY, WEG21_MENUS_DUMMY, { headerMenu: 'int' }).header?.menu,
    ).toEqual(WEG21_MENUS_DUMMY.header.int);
  });
});

describe('dummyWeg21LayoutData', () => {
  it('matches WEG21 dummy fixtures mapped to layout', () => {
    expect(dummyWeg21LayoutData().header?.menu?.[0]?.label).toBe('Find a job');
    expect(dummyWeg21LayoutData().footer?.social?.[0]?.platform).toBe('LinkedIn');
  });
});

describe('fetchWeg21Layout', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('fetches bootstrap and menus then maps to LayoutData', async () => {
    const fetchMock = vi.fn(async (url: string) => {
      if (url.endsWith('/menus')) {
        return new Response(JSON.stringify(WEG21_MENUS_DUMMY), { status: 200 });
      }
      return new Response(JSON.stringify(WEG21_BOOTSTRAP_DUMMY), { status: 200 });
    });
    vi.stubGlobal('fetch', fetchMock);

    const layout = await fetchWeg21Layout({ apiBase: DEFAULT_WEG21_API_BASE, apiKey: 'test-key' });

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock.mock.calls[0][1]?.headers).toMatchObject({ 'wcms-api-key': 'test-key' });
    expect(layout.header?.menu).toEqual(WEG21_MENUS_DUMMY.header.ext);
    expect(layout.footer?.credits).toBe(WEG21_BOOTSTRAP_DUMMY.footer.credit);
  });
});
