import { Injectable } from '@angular/core';
import {
  Auth,
  createUserWithEmailAndPassword,
  updateProfile,
} from '@angular/fire/auth';
import { Firestore, doc, writeBatch } from '@angular/fire/firestore';
import { ISignUpData } from '@shared/models/auth.interface';
import { IUser } from '@shared/models/user.interface';
import { catchError, combineLatest, from, switchMap, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SignUpService {
  constructor(
    private fs: Firestore,
    private auth: Auth,
  ) {}

  signUp({ email, password, username }: ISignUpData) {
    return from(
      createUserWithEmailAndPassword(this.auth, email, password),
    ).pipe(
      catchError((err) =>
        throwError(() => new Error(`Signup failed: ${err.message}`)),
      ),
      switchMap(({ user }) => {
        if (!user.email) {
          return throwError(() => new Error('There is no email'));
        }

        // Collect necessary data
        const userData: IUser = {
          email: user.email,
          created_at: Date.now().toString(),
          photoURL: null,
          uid: user.uid,
          username,
        };
        const usernameData = {
          uid: user.uid,
        };
        const profileData = {
          displayName: username,
          photoURL: undefined,
        };

        // Create docs
        const userDoc = doc(this.fs, 'users', user.uid);
        const usernameDoc = doc(this.fs, 'usernames', username);

        // Set docs
        const batch = writeBatch(this.fs);
        batch.set(userDoc, userData);
        batch.set(usernameDoc, usernameData);

        // Add docs and update profile
        return combineLatest([
          batch.commit(),
          updateProfile(user, profileData),
        ]);
      }),
    );
  }
}
