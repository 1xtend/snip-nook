import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';

import { provideAuth } from '@angular/fire/auth';
import { getAuth } from 'firebase/auth';

import { provideAnimations } from '@angular/platform-browser/animations';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    importProvidersFrom(provideAuth(() => getAuth())),
    provideAnimations(),
  ],
};
