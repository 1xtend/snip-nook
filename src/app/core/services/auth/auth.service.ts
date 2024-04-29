import { Injectable, inject, signal } from '@angular/core';
import {
  Auth,
  authState,
  signInWithEmailAndPassword,
  user,
  User,
} from '@angular/fire/auth';
import { Firestore, getDoc, doc } from '@angular/fire/firestore';
import { JwtHelperService } from '@auth0/angular-jwt';
import { IAuthData } from '@shared/models/auth.interface';
import { LocalStorageEnum } from '@shared/models/local-storage.enum';
import { Observable, catchError, from, map, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  public auth = inject(Auth);
  private fs = inject(Firestore);
  private jwtHelper = new JwtHelperService();

  user$ = user(this.auth);

  get token(): string | null {
    return localStorage.getItem(LocalStorageEnum.AuthToken);
  }

  setToken(token: string): void {
    localStorage.setItem(LocalStorageEnum.AuthToken, token);
  }

  isTokenExpired(): boolean {
    return this.jwtHelper.isTokenExpired(this.token);
  }

  loading = signal<boolean>(false);
  user = signal<User | null>(null);

  checkIfUserIsAuthenticated(): void {
    this.loading.set(true);

    authState(this.auth).subscribe((user) => {
      this.user.set(user);
      this.loading.set(false);
    });
  }

  checkUsername(username: string): Observable<boolean> {
    const usernameDoc = doc(this.fs, 'usernames', username);

    return from(getDoc(usernameDoc)).pipe(map((user) => user.exists()));
  }

  logIn({ email, password }: IAuthData) {
    return from(signInWithEmailAndPassword(this.auth, email, password)).pipe(
      catchError((err) =>
        throwError(() => new Error(`Login failed: ${err.message}`)),
      ),
    );
  }
}
