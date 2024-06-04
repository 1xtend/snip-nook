import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { AuthService } from '@core/services/auth.service';
import { Observable, map, take } from 'rxjs';

export const authGuard: CanActivateFn = (
  route,
  state,
): Observable<boolean | UrlTree> => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.isAuthenticated$.pipe(
    take(1),
    map((authenticated) => (authenticated ? true : router.parseUrl('/login'))),
  );
};
