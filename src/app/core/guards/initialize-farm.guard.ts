import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { UserProfileService } from '../services/user-profile.service';
import { map, of, switchMap } from 'rxjs';

export const initializeFarmGuardFn: CanActivateFn = () => {
  const authService = inject(AuthService);
  const userProfileService = inject(UserProfileService);
  const router = inject(Router);

  return authService.restoreSession().pipe(
    switchMap(() => {
      // If the user is not authenticated, redirect to login
      if (!authService.isAuthenticated()) {
        return of(router.createUrlTree([ '/login' ]));
      }

      // If the user already has a profile, redirect to /dashboard
      return userProfileService.hasProfile().pipe(
        map((hasProfile) => hasProfile ? router.createUrlTree(['/dashboard']) : true)
      );
    })
  );
};
