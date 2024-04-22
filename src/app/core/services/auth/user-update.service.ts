import { Injectable } from '@angular/core';
import {
  EmailAuthProvider,
  User,
  reauthenticateWithCredential,
  updateEmail,
  updatePassword,
  updateProfile,
} from '@angular/fire/auth';
import { Firestore, doc, updateDoc } from '@angular/fire/firestore';
import { IAuthData, IAuthPasswords } from '@shared/models/auth.interface';
import { AuthService } from './auth.service';
import {
  Observable,
  combineLatest,
  from,
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

@Injectable({
  providedIn: 'root',
})
export class UserUpdateService {
  get user$(): Observable<User | undefined> {
    return this.authService.user$;
  }

  constructor(
    private fs: Firestore,
    private storage: Storage,
    private authService: AuthService,
  ) {}

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
}
