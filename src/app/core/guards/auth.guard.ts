import { inject } from '@angular/core';
import { authState } from '@angular/fire/auth';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '@core/services/auth/auth.service';
import { map, take } from 'rxjs';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authState(authService.auth).pipe(
    take(1),
    map((user) => {
      if (user) {
        return true;
      }

      return router.parseUrl('/login');
    }),
  );
};
