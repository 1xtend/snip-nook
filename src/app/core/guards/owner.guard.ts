import { LoadingService } from './../services/loading.service';
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '@core/services/auth.service';
import { finalize, map, take } from 'rxjs';

export const ownerGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const loadingService = inject(LoadingService);

  const userId: string = route.parent?.params['id'];
  loadingService.setLoading(true);

  return authService.user$.pipe(
    take(1),
    map((user) => {
      if (user?.uid === userId) {
        return true;
      }

      return router.parseUrl('/login');
    }),
    finalize(() => {
      loadingService.setLoading(false);
    }),
  );
};
