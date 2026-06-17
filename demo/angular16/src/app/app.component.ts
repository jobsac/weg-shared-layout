import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { POST_LOGOUT_HREF } from './auth';
import { LayoutService } from './layout.service';
import type { LayoutData } from './layout.types';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  constructor(private readonly layoutService: LayoutService) {}

  signedIn = false;
  userName: string | undefined;

  get layoutData(): LayoutData {
    return this.layoutService.layout;
  }

  get headerLayout(): LayoutData {
    return this.layoutService.headerLayout;
  }

  toggleSignedIn(): void {
    this.signedIn = !this.signedIn;
    this.userName = this.signedIn ? 'Alex' : undefined;
  }

  onAuthClick(event: Event): void {
    const customEvent = event as CustomEvent<{ action: 'sign-in' | 'sign-out' }>;
    if (customEvent.detail.action !== 'sign-out') return;

    customEvent.preventDefault();
    this.signedIn = false;
    this.userName = undefined;
    window.location.assign(POST_LOGOUT_HREF);
  }
}
