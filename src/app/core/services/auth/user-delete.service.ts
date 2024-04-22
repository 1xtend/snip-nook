import { FirestoreService } from '@core/services/firestore.service';
import { AuthService } from '@core/services/auth/auth.service';
import { Injectable } from '@angular/core';
import {
  Auth,
  EmailAuthProvider,
  User,
  reauthenticateWithCredential,
  signOut,
} from '@angular/fire/auth';
import { Firestore, doc } from '@angular/fire/firestore';
import {
  EMPTY,
  Observable,
  combineLatest,
  from,
  map,
  switchMap,
  take,
  throwError,
} from 'rxjs';
import { writeBatch } from 'firebase/firestore';
import { Storage, deleteObject, ref } from '@angular/fire/storage';

@Injectable({
  providedIn: 'root',
})
export class UserDeleteService {
  get user$(): Observable<User | undefined> {
    return this.authService.user$;
  }

  constructor(
    private fs: Firestore,
    private auth: Auth,
    private storage: Storage,
    private authService: AuthService,
    private firestoreService: FirestoreService,
  ) {}

  signOut() {
    return from(signOut(this.auth));
  }

  deleteUser(password: string) {
    return this.user$.pipe(
      take(1),
      switchMap((user) => {
        if (!user || !user.email) {
          return throwError(() => new Error('User is not defined'));
        }

        // Credential for reauthentication
        const credential = EmailAuthProvider.credential(user.email, password);

        return from(reauthenticateWithCredential(user, credential)).pipe(
          switchMap(({ user }) => {
            // Delete user snippets collection
            return this.deleteSnippetsCollection(user.uid).pipe(
              map(() => user),
            );
          }),
          switchMap((user) => {
            const deletionPromises = [];
            const batch = writeBatch(this.fs);

            // Delete user doc
            const userDoc = doc(this.fs, 'users', user.uid);
            batch.delete(userDoc);

            // Delete username doc
            if (user.displayName) {
              const usernameDoc = doc(this.fs, 'usernames', user.displayName);
              batch.delete(usernameDoc);
            }

            // Delete avatar
            if (user.photoURL) {
              const avatarRef = deleteObject(ref(this.storage, user.photoURL));
              deletionPromises.push(avatarRef);
            }

            // Delete user account
            deletionPromises.push(user.delete());
            deletionPromises.push(batch.commit());

            return combineLatest(deletionPromises);
          }),
        );
      }),
    );
  }

  private deleteSnippetsCollection(uid: string) {
    return this.firestoreService.deleteCollection('users', uid, 'snippets');
  }
}