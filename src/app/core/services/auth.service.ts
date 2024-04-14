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
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
  updateEmail,
} from '@angular/fire/auth';
import {
  Firestore,
  getDoc,
  setDoc,
  doc,
  deleteDoc,
  updateDoc,
} from '@angular/fire/firestore';
import {
  Storage,
  deleteObject,
  getDownloadURL,
  uploadBytes,
  ref,
} from '@angular/fire/storage';
import {
  AuthData,
  AuthPasswords,
  SignUpData,
} from '@shared/models/auth.interface';
import { IProfile } from '@shared/models/profile.interface';
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
import { FirestoreService } from './firestore.service';

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
    private storage: Storage,
    private firestoreService: FirestoreService,
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

      console.log('AUTH STATE WAS CHANGED');

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
    const userDoc = this.userDoc(user.uid);
    const usernameDoc = this.usernameDoc(user.username);

    return combineLatest([
      from(setDoc(this.userDoc(user.uid), user)),
      from(setDoc(usernameDoc, { uid: userDoc.id })),
    ]);
  }

  updateEmail({ email, password }: AuthData) {
    return this.user$.pipe(
      take(1),
      switchMap((user) => {
        if (!user || !user.email) {
          return this.throwUserError();
        }

        const credential = EmailAuthProvider.credential(user.email, password);
        const userDoc = this.userDoc(user.uid);

        return from(reauthenticateWithCredential(user, credential)).pipe(
          switchMap(() => {
            const emailUpdate$ = from(updateEmail(user, email));
            const docUpdate$ = from(updateDoc(userDoc, { email }));

            return combineLatest([emailUpdate$, docUpdate$]);
          }),
        );
      }),
    );
  }

  updatePassword({ password, newPassword }: AuthPasswords) {
    return this.user$.pipe(
      take(1),
      switchMap((user) => {
        if (!user || !user.email) {
          return this.throwUserError();
        }

        const credential = EmailAuthProvider.credential(user.email, password);

        return from(reauthenticateWithCredential(user, credential)).pipe(
          switchMap(() => {
            return from(updatePassword(user, newPassword));
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
          return this.throwUserError();
        }

        const avatarRef = ref(this.storage, `avatars/${user.uid}`);

        return from(uploadBytes(avatarRef, file)).pipe(
          switchMap(() => getDownloadURL(avatarRef)),
          switchMap((url) => {
            const userDoc = this.userDoc(user.uid);

            const userUpdate$ = this.updateUser(user, { photoURL: url });
            const docUpdate$ = updateDoc(userDoc, { photoURL: url });

            return combineLatest([userUpdate$, docUpdate$]);
          }),
        );
      }),
    );
  }

  checkUsername(username: string): Observable<boolean> {
    const usernameDoc = this.usernameDoc(username);

    return from(getDoc(usernameDoc)).pipe(map((user) => user.exists()));
  }

  deleteUser(password: string) {
    return this.user$.pipe(
      switchMap((user) => {
        if (!user || !user.email) {
          return this.throwUserError();
        }

        const credential = EmailAuthProvider.credential(user.email, password);

        return from(reauthenticateWithCredential(user, credential)).pipe(
          switchMap(async (credential) => {
            const deletionPromises = [];

            deletionPromises.push(deleteDoc(this.userDoc(credential.user.uid)));

            if (credential.user.displayName) {
              deletionPromises.push(
                deleteDoc(this.usernameDoc(credential.user.displayName)),
              );
            }

            if (credential.user.photoURL) {
              deletionPromises.push(
                deleteObject(ref(this.storage, credential.user.photoURL)),
              );
            }

            deletionPromises.push(credential.user.delete());

            return combineLatest(deletionPromises).pipe(
              map(() => 'User successfully deleted'),
            );
          }),
        );
      }),
    );
  }

  userDoc(uid: string) {
    return this.firestoreService.userDoc(uid);
  }

  usernameDoc(username: string) {
    return this.firestoreService.usernameDoc(username);
  }

  throwUserError(): Observable<never> {
    return throwError(() => new Error('User is not defined'));
  }
}
