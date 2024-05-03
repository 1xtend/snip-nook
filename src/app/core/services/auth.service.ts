import { Injectable, computed, inject, signal } from '@angular/core';
import {
  Auth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  user,
  User,
} from '@angular/fire/auth';
import { Firestore, getDoc, doc } from '@angular/fire/firestore';
import { JwtHelperService } from '@auth0/angular-jwt';
import { tapOnce } from '@shared/helpers/tap-once.pipe';
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

  private userSignal = signal<User | null | undefined>(undefined);
  user = computed(this.userSignal);

  private isAuthenticatedSignal = signal<boolean>(
    !!this.token && !this.isTokenExpired(),
  );
  isAuthenticated = computed(this.isAuthenticatedSignal);

  get token(): string | null {
    return localStorage.getItem(LocalStorageEnum.AuthToken);
  }

  setToken(token: string): void {
    localStorage.setItem(LocalStorageEnum.AuthToken, token);
  }

  isTokenExpired(): boolean {
    return this.jwtHelper.isTokenExpired(this.token);
  }

  userChanges(): void {
    this.user$
      .pipe(
        tapOnce(async (user) => {
          if (user && !this.token) {
            const token = await user.getIdToken(true);
            this.setToken(token);
          }
        }, 0),
      )
      .subscribe((user) => {
        console.log('User was changed!', user?.email);
        this.userSignal.set(user);
        this.isAuthenticatedSignal.set(!!user);
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
        const token = await user.getIdToken();
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
