import { Injectable, inject } from '@angular/core';
import {
  Auth,
  EmailAuthProvider,
  reauthenticateWithCredential,
  updateEmail,
  updatePassword,
  updateProfile,
} from '@angular/fire/auth';
import {
  Firestore,
  collectionSnapshots,
  collection,
  doc,
  writeBatch,
  updateDoc,
  collectionData,
  query,
  startAt,
  orderBy,
  limit,
  count,
  getCountFromServer,
  AggregateField,
  AggregateQuerySnapshot,
  startAfter,
  QueryDocumentSnapshot,
  getDocs,
  collectionGroup,
  Query,
} from '@angular/fire/firestore';
import { AuthService } from './auth.service';
import {
  Observable,
  combineLatest,
  from,
  map,
  switchMap,
  take,
  tap,
  throwError,
} from 'rxjs';
import {
  Storage,
  deleteObject,
  getDownloadURL,
  ref,
  uploadBytes,
} from '@angular/fire/storage';
import { IAuthData, IAuthPasswords } from '@shared/models/auth.interface';
import { IUser } from '@shared/models/user.interface';
import { getDoc } from 'firebase/firestore';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private fs = inject(Firestore);
  private auth = inject(Auth);
  private storage = inject(Storage);
  private authService = inject(AuthService);

  user$ = this.authService.user$;

  updateEmail({ email, password }: IAuthData) {
    return this.user$.pipe(
      take(1),
      switchMap((user) => {
        if (!user || !user.email) {
          return throwError(() => new Error('User is not defined'));
        }

        // Credential for reauthentication
        const credential = EmailAuthProvider.credential(user.email, password);
        const userDoc = doc(this.fs, 'users', user.uid);

        return from(reauthenticateWithCredential(user, credential)).pipe(
          switchMap(({ user }) => {
            // Update user email and doc email field
            const userUpdate$ = updateDoc(userDoc, { email });
            const emailUpdate$ = updateEmail(user, email);

            return combineLatest([userUpdate$, emailUpdate$]);
          }),
        );
      }),
    );
  }

  updatePassword({ password, newPassword }: IAuthPasswords) {
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
            // Update user password
            return updatePassword(user, newPassword);
          }),
        );
      }),
    );
  }

  updateAvatar(file: File) {
    return this.user$.pipe(
      take(1),
      switchMap((user) => {
        if (!user || !user.email) {
          return throwError(() => new Error('User is not defined'));
        }

        // Find or create avatar ref
        const avatarRef = ref(this.storage, `avatars/${user.uid}`);
        const userDoc = doc(this.fs, 'users', user.uid);

        return from(uploadBytes(avatarRef, file)).pipe(
          // Get avatar image url
          switchMap(() => getDownloadURL(avatarRef)),
          switchMap((url) => {
            // Update user photoURL and doc photoURL field
            const userUpdate$ = updateDoc(userDoc, { photoURL: url });
            const avatarUpdate$ = updateProfile(user, { photoURL: url });

            return combineLatest([userUpdate$, avatarUpdate$]);
          }),
        );
      }),
    );
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
            return this.deleteUserSnippets(user.uid).pipe(map(() => user));
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

  getUsers(pageSize: number, startAfterDoc?: any) {
    const usersCollection = collection(this.fs, 'users');
    let usersQuery: Query;

    if (startAfterDoc) {
      usersQuery = query(
        usersCollection,
        orderBy('created_at'),
        startAfter(startAfter),
        limit(pageSize),
      );
    } else {
      usersQuery = query(
        usersCollection,
        orderBy('created_at'),
        limit(pageSize),
      );
    }

    return collectionData(usersQuery) as Observable<IUser[]>;
  }

  private deleteUserSnippets(uid: string) {
    const snippetsCollection = collection(this.fs, 'users', uid, 'snippets');

    return collectionSnapshots(snippetsCollection).pipe(
      take(1),
      switchMap((res) => {
        const batch = writeBatch(this.fs);

        res.forEach((docSnapshot) => {
          const userSnippetRef = doc(
            this.fs,
            'users',
            uid,
            'snippets',
            docSnapshot.id,
          );
          batch.delete(userSnippetRef);

          const snippetRef = doc(this.fs, 'snippets', docSnapshot.id);
          batch.delete(snippetRef);
        });

        return batch.commit();
      }),
    );
  }
}
