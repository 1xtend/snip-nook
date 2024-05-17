import { AuthService } from './../services/auth.service';
import { FirestoreService } from '@core/services/firestore.service';
import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { finalize, map, of, switchMap, take } from 'rxjs';
import { LoadingService } from '@core/services/loading.service';

export const snippetOwnerGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const firestoreService = inject(FirestoreService);
  const router = inject(Router);
  const loadingService = inject(LoadingService);

  const snippetId = route.params['id'];
  loadingService.setLoading(true);

  return authService.user$.pipe(
    take(1),
    switchMap((user) => {
      const userId = user?.uid;

      return userId
        ? firestoreService.checkUserSnippet(userId, snippetId).pipe(
            take(1),
            map((snippet) => {
              return !!snippet;
            }),
          )
        : of(false);
    }),
    map((owner) => {
      return owner ? true : router.parseUrl('/login');
    }),
    finalize(() => {
      loadingService.setLoading(false);
    }),
  );
};
