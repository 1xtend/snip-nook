import { Injectable } from '@angular/core';
import {
  Auth,
  UserCredential,
  authState,
  createUserWithEmailAndPassword,
  signOut,
  signInWithEmailAndPassword,
  User,
} from '@angular/fire/auth';
import { Firestore, getDoc, setDoc, doc } from '@angular/fire/firestore';
import { AuthData, SignUpData } from '@shared/models/auth.interface';
import { IUser } from '@shared/models/user.interface';
import {
  BehaviorSubject,
  Observable,
  catchError,
  combineLatest,
  from,
  map,
  switchMap,
  take,
  throwError,
} from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private loadingSubject = new BehaviorSubject<boolean>(false);
  loading$ = this.loadingSubject.asObservable();

  private userSubject = new BehaviorSubject<User | undefined>(undefined);
  user$ = this.userSubject.asObservable();

  constructor(
    public auth: Auth,
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
          created_at: new Date().toString(),
        };

        return this.setUser(user).pipe(
          catchError((err) => throwError(() => new Error(err))),
          map(() => user),
        );
      }),
    );
  }

  signOut(): Observable<void> {
    return from(signOut(this.auth));
  }

  checkIfUserIsAuthenticated(): void {
    this.loadingSubject.next(true);

    authState(this.auth).subscribe((user) => {
      this.userSubject.next(user ?? undefined);

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

  checkUsername(username: string): Observable<boolean> {
    const usernameDoc = doc(this.fs, 'usernames', username);

    return from(getDoc(usernameDoc)).pipe(map((user) => user.exists()));
  }
}
