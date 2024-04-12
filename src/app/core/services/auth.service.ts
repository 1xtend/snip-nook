import { Injectable } from '@angular/core';
import {
  Auth,
  UserCredential,
  authState,
  createUserWithEmailAndPassword,
  signOut,
  signInWithEmailAndPassword,
  User,
  updateProfile,
} from '@angular/fire/auth';
import { Firestore, getDoc, setDoc, doc } from '@angular/fire/firestore';
import { Storage, getDownloadURL, uploadBytes } from '@angular/fire/storage';
import { environment } from '@environments/environment';
import { AuthData, SignUpData } from '@shared/models/auth.interface';
import { IProfile } from '@shared/models/profile.interface';
import { IUser } from '@shared/models/user.interface';
import {
  EmailAuthCredential,
  EmailAuthProvider,
  reauthenticateWithCredential,
  updateEmail,
} from 'firebase/auth';
import { updateDoc } from 'firebase/firestore';
import { ref } from 'firebase/storage';
import {
  BehaviorSubject,
  EMPTY,
  Observable,
  catchError,
  combineLatest,
  from,
  map,
  merge,
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
    private storage: Storage,
  ) {}

  logIn({ email, password }: AuthData): Observable<UserCredential> {
    return from(signInWithEmailAndPassword(this.auth, email, password)).pipe(
      catchError((err) => throwError(() => new Error(err))),
    );
  }

  signUp({ email, password, username }: SignUpData) {
    return from(
      createUserWithEmailAndPassword(this.auth, email, password),
    ).pipe(
      catchError((err) => throwError(() => new Error(err))),
      switchMap((res) => {
        const user: IUser = {
          email: res.user.email!,
          uid: res.user.uid,
          username,
          created_at: Date.now().toString(),
          photoURL: null,
        };

        const profile: Partial<IProfile> = {
          displayName: username,
          photoURL: undefined,
        };

        return combineLatest({
          user: this.setUser(user),
          profile: from(updateProfile(res.user, profile)),
        }).pipe(catchError((err) => throwError(() => new Error(err))));
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

      console.log('AUTH STATE WAS CHANGED: ', user);

      console.log('USER displayName: ', user?.displayName);

      this.loadingSubject.next(false);
    });
  }

  updateUser(
    currentUser: User,
    options: { displayName?: string; photoURL?: string },
  ) {
    return from(updateProfile(currentUser, options));
  }

  private setUser(user: IUser): Observable<[void, void]> {
    const userDoc = doc(this.fs, 'users', user.uid);
    const usernameDoc = doc(this.fs, 'usernames', user.username);

    return combineLatest([
      from(setDoc(userDoc, user)),
      from(setDoc(usernameDoc, { uid: userDoc.id })),
    ]);
  }

  updateEmail({ email, password }: AuthData) {
    return this.user$.pipe(
      take(1),
      switchMap((user) => {
        if (!user || !user.email) {
          return throwError(() => new Error('User is not defined'));
        }

        const credential = EmailAuthProvider.credential(user.email, password);
        const userDoc = doc(this.fs, 'users', user.uid);

        return from(reauthenticateWithCredential(user, credential)).pipe(
          take(1),
          switchMap(() => {
            return combineLatest({
              user: from(updateEmail(user, email)),
              doc: from(
                updateDoc(userDoc, {
                  email,
                }),
              ),
            });
          }),
        );
      }),
    );
  }

  updateAvatar(file: File) {
    return this.user$.pipe(
      take(1),
      switchMap((user) => {
        if (!user) {
          return throwError(() => new Error('User is not defined'));
        }

        const avatarRef = ref(this.storage, `avatars/${user.uid}`);

        return from(uploadBytes(avatarRef, file)).pipe(
          switchMap(() => getDownloadURL(avatarRef)),
          switchMap((url) => {
            const userDoc = doc(this.fs, 'users', user.uid);

            const userUpdate$ = this.updateUser(user, { photoURL: url });
            const docUpdate$ = updateDoc(userDoc, {
              photoURL: url,
            });

            return combineLatest([userUpdate$, docUpdate$]);
          }),
        );
      }),
    );
  }

  checkUsername(username: string): Observable<boolean> {
    const usernameDoc = doc(this.fs, 'usernames', username);

    return from(getDoc(usernameDoc)).pipe(map((user) => user.exists()));
  }
}
