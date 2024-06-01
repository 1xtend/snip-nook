import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '@core/services/auth.service';
import { map } from 'rxjs';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // return authService.isAuthenticated() ? true : router.parseUrl('/login');

  return authService.isAuthenticated$.pipe(
    map((authenticated) => {
      return authenticated ? true : router.parseUrl('/login');
    }),
  );
};
