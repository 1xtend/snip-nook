import { AuthService } from './../services/auth.service';
import { FirestoreService } from '@core/services/firestore.service';
import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { map, of, switchMap, take } from 'rxjs';

export const snippetOwnerGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const firestoreService = inject(FirestoreService);
  const router = inject(Router);

  const snippetId = route.params['id'];

  return authService.user$.pipe(
    take(1),
    map((user) => {
      const userId = user?.uid;

      return userId
        ? firestoreService.checkUserSnippet(userId, snippetId).pipe(
            take(1),
            map((snippet) => {
              console.log(snippet);
              return !!snippet;
            }),
          )
        : of(false);
    }),
    map((owner) => {
      return owner ? true : router.parseUrl('/login');
    }),
  );
};
