import { Injectable } from '@angular/core';
import bootstrapDummy from 'weg-shared-layout/weg21-bootstrap.json';
import menusDummy from 'weg-shared-layout/weg21-menus.json';
import type { MenusProps, Weg21BootstrapProps } from 'weg-shared-layout/menus-data';

import type { LayoutData } from './layout.types';
import { WEG21_API_BASE, WEG21_API_KEY } from './local-api-key';

const WEG21_HEADERS = {
  Accept: 'application/json',
  'wcms-api-key': WEG21_API_KEY,
};

function menusToLayoutData(bootstrap: Pick<Weg21BootstrapProps, 'footer'>, menus: MenusProps): LayoutData {
  const { credit, copyright, social_links } = bootstrap.footer;

  return {
    header: { menu: menus.header.ext },
    footer: {
      menu: menus.footer,
      social: social_links,
      credits: credit.trim() || undefined,
      copyright: copyright.trim() || undefined,
    },
  };
}

function dummyWeg21LayoutData(): LayoutData {
  return menusToLayoutData(bootstrapDummy as Weg21BootstrapProps, menusDummy as MenusProps);
}

async function fetchWeg21Layout(): Promise<LayoutData> {
  const [bootstrapRes, menusRes] = await Promise.all([
    fetch(WEG21_API_BASE, { headers: WEG21_HEADERS }),
    fetch(`${WEG21_API_BASE}/menus`, { headers: WEG21_HEADERS }),
  ]);

  if (!bootstrapRes.ok || !menusRes.ok) {
    throw new Error(`WEG21 API error: bootstrap=${bootstrapRes.status} menus=${menusRes.status}`);
  }

  const bootstrap = (await bootstrapRes.json()) as Weg21BootstrapProps;
  const menus = (await menusRes.json()) as MenusProps;

  return menusToLayoutData(bootstrap, menus);
}

@Injectable({ providedIn: 'root' })
export class LayoutService {
  layout: LayoutData = dummyWeg21LayoutData();
  loadError: string | null = null;

  constructor() {
    void this.loadFromApi();
  }

  get headerLayout(): LayoutData {
    return this.layout;
  }

  private async loadFromApi(): Promise<void> {
    if (!WEG21_API_KEY) {
      this.loadError =
        'Live CMS disabled - add your API base and key in src/app/local-api-key.ts to enable API fetches.';
      return;
    }

    try {
      this.layout = await fetchWeg21Layout();
      this.loadError = null;
    } catch {
      this.loadError =
        'WEG21 API unavailable - showing WEG21 dummy fixtures.';
    }
  }
}
