import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { providePrimeNG } from 'primeng/config';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

import { AuraPreset } from './theme';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptorFn } from './core/interceptors/auth.interceptor';
import { provideCacheableAnimationLoader, provideLottieOptions } from 'ngx-lottie';

import player from 'lottie-web';
import { provideAnimations } from '@angular/platform-browser/animations';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideAnimationsAsync(),
    providePrimeNG({
      theme: {
        preset: AuraPreset
      }
    }),
    provideHttpClient(withInterceptors([authInterceptorFn])),
    provideLottieOptions({ player: () => player }),
    provideAnimations()
  ]
};
