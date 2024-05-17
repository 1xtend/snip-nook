import { Injectable, computed, inject, signal } from '@angular/core';
import {
  Auth,
  authState,
  createUserWithEmailAndPassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  user,
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
  EMPTY,
  Observable,
  catchError,
  combineLatest,
  finalize,
  forkJoin,
  from,
  map,
  of,
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
  private storage = inject(Storage);
  private jwtHelper = new JwtHelperService();

  user$ = user(this.auth);

  private userSignal = signal<User | null>(null);
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
    authState(this.auth)
      .pipe(
        tap(async (user) => {
          if (user && !this.token) {
            const token = await user.getIdToken(true);
            this.setToken(token);
          }

          if (!user && this.token) {
            this.clearStorage();
          }
        }),
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
      catchError((err) =>
        throwError(() => new Error(`Login failed: ${err.message}`)),
      ),
      tap(async (user) => {
        const token = await user.getIdToken(true);
        this.setToken(token);
      }),
    );
  }

  signUp({ email, password, username }: ISignUpData): Observable<User> {
    return from(
      createUserWithEmailAndPassword(this.auth, email, password),
    ).pipe(
      map((credential) => credential.user),
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
          created_at: new Date().toString(),
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
      tap(async (user) => {
        const token = await user.getIdToken();
        this.setToken(token);
      }),
    );
  }

  signOut(): Observable<void> {
    return from(signOut(this.auth)).pipe(
      finalize(() => {
        this.clearStorage();
      }),
    );
  }

  deleteUser(password: string) {
    return this.user$.pipe(
      take(1),
      switchMap((user) => this.reauthenticate(user, password)),
      switchMap((user) => this.deleteUserData(user)),
      switchMap((user) => this.deleteUserAccount(user)),
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
      catchError((error) => {
        return throwError(() => new Error('Reauthentication failed'));
      }),
    );
  }

  private clearStorage(): void {
    localStorage.removeItem(LocalStorageEnum.AuthToken);
  }
}
