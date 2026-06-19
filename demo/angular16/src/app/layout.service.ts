import { ChangeDetectorRef, Injectable } from '@angular/core';
import { dummyWeg21LayoutData, fetchWeg21Layout } from 'weg-shared-layout/menus';

import type { LayoutData } from './layout.types';

@Injectable({ providedIn: 'root' })
export class LayoutService {
  layout: LayoutData = dummyWeg21LayoutData();
  loadError: string | null = null;

  constructor(private readonly cdr: ChangeDetectorRef) {
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
        'WEG21 API unavailable — showing WEG21 dummy fixtures. Set wcms-api-key when the CMS endpoint is live.';
    } finally {
      this.cdr.markForCheck();
    }
  }
}
