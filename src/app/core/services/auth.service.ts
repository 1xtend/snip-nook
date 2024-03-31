import { Injectable } from '@angular/core';
import {
  Auth,
  UserCredential,
  authState,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from '@angular/fire/auth';
import { AuthData } from '@shared/models/auth.interface';
import { signOut } from 'firebase/auth';
import { BehaviorSubject, Observable, Subject, from, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private isLoggedInSubject = new BehaviorSubject<boolean>(false);
  isLoggedIn$ = this.isLoggedInSubject.asObservable();

  constructor(private auth: Auth) {}

  logIn({ email, password }: AuthData): Observable<UserCredential> {
    return from(signInWithEmailAndPassword(this.auth, email, password)).pipe(
      tap((user) => {
        console.log('Logged in', user);
      }),
    );
  }

  signUp({ email, password }: AuthData): Observable<UserCredential> {
    return from(
      createUserWithEmailAndPassword(this.auth, email, password),
    ).pipe(
      tap((user) => {
        console.log('Signed up', user);
      }),
    );
  }

  logOut(): Observable<void> {
    return from(signOut(this.auth));
  }

  checkIfUserIsAuthenticated(): void {
    authState(this.auth).subscribe((user) => {
      if (user) {
        this.isLoggedInSubject.next(true);
      } else {
        this.isLoggedInSubject.next(false);
      }

      console.log('Is authenticated', user);
    });
  }
}
