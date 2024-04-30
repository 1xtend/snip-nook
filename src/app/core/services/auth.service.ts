import { Injectable, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  Auth,
  createUserWithEmailAndPassword,
  idToken,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  user,
  User,
} from '@angular/fire/auth';
import { Firestore, getDoc, doc } from '@angular/fire/firestore';
import { JwtHelperService } from '@auth0/angular-jwt';
import { IAuthData, ISignUpData } from '@shared/models/auth.interface';
import { LocalStorageEnum } from '@shared/models/local-storage.enum';
import { IUser } from '@shared/models/user.interface';
import { writeBatch } from 'firebase/firestore';
import {
  Observable,
  catchError,
  combineLatest,
  from,
  map,
  switchMap,
  take,
  tap,
  throwError,
} from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  public auth = inject(Auth);
  private fs = inject(Firestore);
  private jwtHelper = new JwtHelperService();

  user$ = user(this.auth);
  user = toSignal(this.user$, { initialValue: undefined });

  get token(): string | null {
    return localStorage.getItem(LocalStorageEnum.AuthToken);
  }

  setToken(token: string): void {
    localStorage.setItem(LocalStorageEnum.AuthToken, token);
  }

  isTokenExpired(): boolean {
    return this.jwtHelper.isTokenExpired(this.token);
  }

  checkIfTokenIsSaved(): void {
    idToken(this.auth)
      .pipe(take(1))
      .subscribe((userToken) => {
        if (!this.token && userToken) {
          this.setToken(userToken);
        }
      });
  }

  checkUsername(username: string): Observable<boolean> {
    const usernameDoc = doc(this.fs, 'usernames', username);
    return from(getDoc(usernameDoc)).pipe(map((user) => user.exists()));
  }

  logIn({ email, password }: IAuthData): Observable<User> {
    return from(signInWithEmailAndPassword(this.auth, email, password)).pipe(
      map((credential) => credential.user),
      tap(async (user) => {
        const token = await user.getIdToken(true);
        this.setToken(token);
      }),
      catchError((err) =>
        throwError(() => new Error(`Login failed: ${err.message}`)),
      ),
    );
  }

  signUp({ email, password, username }: ISignUpData): Observable<User> {
    return from(
      createUserWithEmailAndPassword(this.auth, email, password),
    ).pipe(
      map((credential) => credential.user),
      tap(async (user) => {
        const token = await user.getIdToken(true);
        this.setToken(token);
      }),
      catchError((err) =>
        throwError(() => new Error(`Signup failed: ${err.message}`)),
      ),
      switchMap((user) => {
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
        ]).pipe(map(() => user));
      }),
    );
  }

  signOut(): Observable<void> {
    return from(signOut(this.auth)).pipe(
      tap(() => {
        localStorage.removeItem(LocalStorageEnum.AuthToken);
      }),
    );
  }
}
