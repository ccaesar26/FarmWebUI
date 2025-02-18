import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { first, map } from 'rxjs';

export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.fetchUserRole().pipe(
    map(() => {
      if (authService.isAuthenticated() && authService.userRole() === 'Manager') {
        return true;
      }
      return router.createUrlTree(['/login']);
    }),
    first()
  );
};
