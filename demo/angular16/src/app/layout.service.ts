import { Injectable } from '@angular/core';
import layoutFixture from 'weg-shared-layout/dummy-data.json';

import type { LayoutData } from './layout.types';

@Injectable({ providedIn: 'root' })
export class LayoutService {
  readonly layout: LayoutData = layoutFixture;

  /** Same payload as footer; header reads `header.menu` from fixture */
  get headerLayout(): LayoutData {
    return this.layout;
  }
}
