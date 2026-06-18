import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs/operators';

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
export class AppComponent implements OnInit {
  constructor(
    private readonly layoutService: LayoutService,
    private readonly router: Router,
  ) {}

  signedIn = false;
  userName: string | undefined;
  currentPath = '/';

  get layoutData(): LayoutData {
    return this.layoutService.layout;
  }

  get headerLayout(): LayoutData {
    return this.layoutService.headerLayout;
  }

  ngOnInit(): void {
    this.updateCurrentPath();
    this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe(() => this.updateCurrentPath());
  }

  private updateCurrentPath(): void {
    this.currentPath = this.router.url || '/';
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
