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
  collection,
  doc,
  updateDoc,
  collectionData,
  query,
  orderBy,
  limit,
  startAfter,
  Query,
  QueryDocumentSnapshot,
  DocumentData,
  getDocs,
} from '@angular/fire/firestore';
import { AuthService } from './auth.service';
import {
  Observable,
  catchError,
  combineLatest,
  forkJoin,
  from,
  map,
  switchMap,
  take,
  throwError,
} from 'rxjs';
import {
  Storage,
  getDownloadURL,
  ref,
  uploadBytes,
} from '@angular/fire/storage';
import { IAuthData, IAuthPasswords } from '@shared/models/auth.interface';
import { IUser } from '@shared/models/user.interface';
import { getDoc } from 'firebase/firestore';
import { ErrorService } from './error.service';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private fs = inject(Firestore);
  private storage = inject(Storage);
  private authService = inject(AuthService);
  private errorService = inject(ErrorService);

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
          catchError((err) => this.errorService.handleError(err)),
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
          catchError((err) => this.errorService.handleError(err)),
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

  getUsers(
    perPage: number,
    startAfterDoc?: QueryDocumentSnapshot<DocumentData>,
  ) {
    const usersCollection = collection(this.fs, 'users');
    let usersQuery = query(
      usersCollection,
      orderBy('created_at'),
      limit(perPage),
    );

    if (startAfterDoc) {
      usersQuery = query(
        usersCollection,
        orderBy('created_at'),
        startAfter(startAfterDoc),
        limit(perPage),
      );
    }

    return forkJoin({
      snapshot: getDocs(usersQuery),
      count: this.getUsersCount(),
    }).pipe(
      map(({ snapshot, count }) => {
        const users = snapshot.docs.map(
          (doc) =>
            ({
              uid: doc.id,
              ...doc.data(),
            }) as IUser,
        );

        return { users, count };
      }),
    );

    // return forkJoin([
    //   getDocs(usersQuery),
    //   this.getUsersCount()
    // ]).pipe(
    //   map(([users]) => {

    //   })
    // )

    // return from(getDocs(usersQuery)).pipe(
    //   switchMap(async (snapshot) => {
    //     const count = await getDocs(usersQuery);
    // const users = snapshot.docs.map(
    //   (doc) =>
    //     ({
    //       uid: doc.id,
    //       ...doc.data(),
    //     }) as IUser,
    // );

    //     return {
    //       count: count.size,
    //       users,
    //     };
    //   }),
    // );
  }

  private async getUsersCount(): Promise<number> {
    const usersCollection = collection(this.fs, 'users');
    const users = await getDocs(usersCollection);

    return users.size;
  }
}
