import { Injectable } from '@angular/core';
import bootstrapDummy from 'weg-shared-layout/weg21-bootstrap.json';
import menusDummy from 'weg-shared-layout/weg21-menus.json';
import type { MenusProps, Weg21BootstrapProps } from 'weg-shared-layout/menus-data';

import type { LayoutData } from './layout.types';

const WEG21_API_BASE = 'https://dev.warwickemploymentgroup.com/api/v1/weg21';
const WEG21_API_KEY = '9hVxD7PkcXfmHho2x2AF';
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
    try {
      this.layout = await fetchWeg21Layout();
      this.loadError = null;
    } catch {
      this.loadError =
        'WEG21 dev API unavailable - showing WEG21 dummy fixtures.';
    }
  }
}
