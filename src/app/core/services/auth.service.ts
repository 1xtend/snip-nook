import { Injectable, inject } from '@angular/core';
import {
  Auth,
  authState,
  createUserWithEmailAndPassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  User,
} from '@angular/fire/auth';
import {
  Firestore,
  getDoc,
  doc,
  collectionSnapshots,
} from '@angular/fire/firestore';
import { Storage } from '@angular/fire/storage';
import { JwtHelperService } from '@auth0/angular-jwt';
import { IAuthData, ISignUpData } from '@shared/models/auth.interface';
import { LocalStorageEnum } from '@shared/models/local-storage.enum';
import { IUser } from '@shared/models/user.interface';
import { WriteBatch, collection, writeBatch } from 'firebase/firestore';
import { deleteObject, ref } from 'firebase/storage';
import {
  Observable,
  ReplaySubject,
  catchError,
  distinctUntilChanged,
  finalize,
  forkJoin,
  from,
  map,
  merge,
  of,
  shareReplay,
  switchMap,
  take,
  tap,
  throwError,
} from 'rxjs';
import { ErrorService } from './error.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  public auth = inject(Auth);
  private fs = inject(Firestore);
  private errorService = inject(ErrorService);
  private storage = inject(Storage);
  private jwtHelper = new JwtHelperService();

  user$: Observable<User | null> = authState(this.auth).pipe(
    tap((user) => {
      if (user && !this.token) {
        this.setAuthToken(user);
      }

      if (!user && this.token) {
        this.clearStorage();
      }
    }),
    shareReplay(1),
  );

  isAuthenticated$: Observable<boolean> = merge(
    of(!!this.token && !this.isTokenExpired()),
    this.user$.pipe(map((user) => !!user)),
  ).pipe(
    distinctUntilChanged(),
    shareReplay(1),
    tap((value) => {
      console.log('isAuthenticated', value);
    }),
  );

  get token(): string | null {
    return localStorage.getItem(LocalStorageEnum.AuthToken);
  }

  setToken(token: string): void {
    localStorage.setItem(LocalStorageEnum.AuthToken, token);
  }

  isTokenExpired(): boolean {
    return this.jwtHelper.isTokenExpired(this.token);
  }

  checkUsername(username: string): Observable<boolean> {
    const usernameDoc = doc(this.fs, 'usernames', username);
    return from(getDoc(usernameDoc)).pipe(map((user) => user.exists()));
  }

  logIn({ email, password }: IAuthData): Observable<User> {
    return from(signInWithEmailAndPassword(this.auth, email, password)).pipe(
      map((credential) => credential.user),
      catchError((err) => this.errorService.handleError(err)),
      tap((user) => this.setAuthToken(user)),
    );
  }

  signOut(): Observable<void> {
    return from(signOut(this.auth)).pipe(
      finalize(() => {
        this.clearStorage();
      }),
    );
  }

  // Sign Up
  signUp({ email, password, username }: ISignUpData) {
    return from(
      createUserWithEmailAndPassword(this.auth, email, password),
    ).pipe(
      map((credential) => credential.user),
      switchMap((user) => this.createUser(user, username)),
      catchError((err) => this.errorService.handleError(err)),
      tap((user) => this.setAuthToken(user)),
    );
  }

  private createUser(user: User, username: string) {
    if (!user.email) {
      return throwError(() => new Error('There is no email'));
    }

    const userData: IUser = {
      email: user.email,
      created_at: new Date().toString(),
      photoURL: null,
      uid: user.uid,
      username,
    };

    const usernameData: { uid: string } = {
      uid: user.uid,
    };

    const profileData: Partial<User> = {
      displayName: username,
      photoURL: null,
    };

    const userDoc = doc(this.fs, 'users', user.uid);
    const usernameDoc = doc(this.fs, 'usernames', username);

    const batch = writeBatch(this.fs);
    batch.set(userDoc, userData);
    batch.set(usernameDoc, usernameData);

    return this.setupUser(batch, user, profileData);
  }

  private setupUser(batch: WriteBatch, user: User, profileData: Partial<User>) {
    return forkJoin([
      from(batch.commit()),
      from(updateProfile(user, profileData)),
    ]).pipe(map(() => user));
  }

  // Delete user
  deleteUser(password: string): Observable<unknown> {
    return this.user$.pipe(
      take(1),
      switchMap((user) => this.reauthenticate(user, password)),
      switchMap((user) => this.deleteUserData(user)),
      switchMap((user) => this.deleteUserAccount(user)),
      catchError((err) => this.errorService.handleError(err)),
    );
  }

  private deleteUserData(user: User): Observable<User> {
    const batch = writeBatch(this.fs);

    const snippetsCollection = collection(
      this.fs,
      'users',
      user.uid,
      'snippets',
    );
    return collectionSnapshots(snippetsCollection).pipe(
      take(1),
      switchMap((snapshot) => {
        snapshot.forEach((docSnapshot) => {
          const userSnippetRef = doc(
            this.fs,
            'users',
            user.uid,
            'snippets',
            docSnapshot.id,
          );
          batch.delete(userSnippetRef);

          const snippetRef = doc(this.fs, 'snippets', docSnapshot.id);
          batch.delete(snippetRef);
        });

        if (user.displayName) {
          const usernameDoc = doc(this.fs, 'usernames', user.displayName);
          batch.delete(usernameDoc);
        }

        const userDoc = doc(this.fs, 'users', user.uid);
        batch.delete(userDoc);

        return from(batch.commit()).pipe(
          take(1),
          map(() => user),
          catchError((error) => {
            return throwError(() => new Error('Error deleting user data'));
          }),
        );
      }),
    );
  }

  private deleteUserAccount(user: User) {
    const deletionPromises: Promise<any>[] = [];

    if (user.photoURL) {
      const avatarRef = ref(this.storage, user.photoURL);
      deletionPromises.push(deleteObject(avatarRef));
    }

    deletionPromises.push(user.delete());

    return forkJoin(deletionPromises).pipe(
      take(1),
      tap(() => this.clearStorage()),
      catchError((error) => {
        return throwError(() => new Error('Error deleting user account'));
      }),
    );
  }

  // Helpers
  private reauthenticate(
    user: User | null,
    password: string,
  ): Observable<User> {
    if (!user || !user.email) {
      return throwError(() => new Error('User is not defined'));
    }

    const credential = EmailAuthProvider.credential(user.email, password);

    return from(reauthenticateWithCredential(user, credential)).pipe(
      take(1),
      map(({ user }) => user),
    );
  }

  private clearStorage(): void {
    localStorage.removeItem(LocalStorageEnum.AuthToken);
  }

  private async setAuthToken(user: User) {
    const token = await user.getIdToken();
    this.setToken(token);
  }
}
