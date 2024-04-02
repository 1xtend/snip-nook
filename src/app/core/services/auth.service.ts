import { Injectable } from '@angular/core';
import {
  Auth,
  UserCredential,
  authState,
  createUserWithEmailAndPassword,
  signOut,
  signInWithEmailAndPassword,
  updateCurrentUser,
} from '@angular/fire/auth';
import {
  Firestore,
  getDoc,
  setDoc,
  doc,
  docData,
} from '@angular/fire/firestore';
import { AuthData, SignUpData } from '@shared/models/auth.interface';
import { IUser } from '@shared/models/user.interface';
import { addDoc, collection } from 'firebase/firestore';
import {
  BehaviorSubject,
  Observable,
  Subject,
  catchError,
  combineLatest,
  from,
  map,
  merge,
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

  private loadingSubject = new BehaviorSubject<boolean>(false);
  loading$ = this.loadingSubject.asObservable();

  private user: IUser | undefined = undefined;

  constructor(
    private auth: Auth,
    private fs: Firestore,
  ) {}

  logIn({ email, password }: AuthData): Observable<UserCredential> {
    return from(signInWithEmailAndPassword(this.auth, email, password)).pipe(
      catchError((err) => throwError(() => new Error(err))),
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
    this.loadingSubject.next(true);

    authState(this.auth).subscribe((user) => {
      if (user) {
        this.isLoggedInSubject.next(true);
      } else {
        this.isLoggedInSubject.next(false);
      }

      this.loadingSubject.next(false);
    });
  }

  private setUser(user: IUser): Observable<[void, void]> {
    const userDoc = doc(this.fs, 'users', user.uid);
    const usernameDoc = doc(this.fs, 'usernames', user.username);

    return combineLatest([
      from(setDoc(userDoc, user)),
      from(setDoc(usernameDoc, { uid: userDoc.id })),
    ]);
  }

  private getUser(uid: string) {}

  checkUsername(username: string): Observable<boolean> {
    const usernameDoc = doc(this.fs, 'usernames', username);

    return from(getDoc(usernameDoc)).pipe(map((user) => user.exists()));
  }
}
