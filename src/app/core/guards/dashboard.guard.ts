import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { map, of, switchMap } from 'rxjs';
import { UserProfileService } from '../services/user-profile.service';

export const dashboardGuardFn: CanActivateFn = () => {
  const authService = inject(AuthService);
  const userProfileService = inject(UserProfileService);
  const router = inject(Router);

  return authService.restoreSession().pipe(
    switchMap(() => {
      // Redirect to login if user is not authenticated
      if (!authService.isAuthenticated()) {
        return of(router.createUrlTree([ '/login' ]));
      }

      // Redirect to initialize-farm if user has no profile
      return userProfileService.hasProfile().pipe(
        map(hasProfile => hasProfile ? true : router.createUrlTree([ '/initialize-farm' ]))
      );
    })
  );
};
