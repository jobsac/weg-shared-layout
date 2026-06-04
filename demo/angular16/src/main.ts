import { bootstrapApplication } from '@angular/platform-browser';
import { defineCustomElements } from 'weg-shared-layout/loader';

import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';

defineCustomElements();

bootstrapApplication(AppComponent, appConfig).catch((err) => console.error(err));
