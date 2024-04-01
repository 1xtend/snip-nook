import { Injectable } from '@angular/core';
import {
  Auth,
  UserCredential,
  authState,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  user,
} from '@angular/fire/auth';
import {
  Firestore,
  getDoc,
  setDoc,
  doc,
  collection,
  addDoc,
} from '@angular/fire/firestore';
import { AuthData, SignUpData } from '@shared/models/auth.interface';
import { IUser } from '@shared/models/user.interface';
import { signOut } from 'firebase/auth';
import {
  BehaviorSubject,
  Observable,
  Subject,
  catchError,
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
  private isLoggedInSubject = new Subject<boolean>();
  isLoggedIn$ = this.isLoggedInSubject.asObservable();

  user: IUser | undefined = undefined;

  isLoggedIn = this.auth.currentUser !== null;

  constructor(
    private auth: Auth,
    private fs: Firestore,
  ) {}

  logIn({ email, password }: AuthData): Observable<UserCredential> {
    return from(signInWithEmailAndPassword(this.auth, email, password)).pipe(
      tap((user) => {
        console.log('Logged in', user);
      }),
    );
  }

  signUp({ email, password, username }: SignUpData): Observable<IUser> {
    return from(
      createUserWithEmailAndPassword(this.auth, email, password),
    ).pipe(
      catchError((err) => throwError(() => new Error(err))),
      switchMap((res) => {
        const user: IUser = {
          email: res.user.email!,
          uid: res.user.uid,
          username,
        };

        return this.setUser(user).pipe(
          catchError((err) => throwError(() => new Error(err))),
          map(() => user),
        );
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
      // console.log('Is authenticated', user);
    });
  }

  private setUser(user: IUser) {
    const userDoc = doc(this.fs, 'users', user.username);

    return from(setDoc(userDoc, user));
  }

  checkUsername(username: string): Observable<boolean> {
    const usernameDoc = doc(this.fs, 'users', username);

    return from(getDoc(usernameDoc)).pipe(map((user) => user.exists()));
  }
}
