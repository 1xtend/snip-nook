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
  writeBatch,
} from '@angular/fire/firestore';
import {
  Storage,
  deleteObject,
  getDownloadURL,
  uploadBytes,
  ref,
} from '@angular/fire/storage';
import {
  IAuthData,
  IAuthPasswords,
  ISignUpData,
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
import { FirestoreService } from '../firestore.service';

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

  checkIfUserIsAuthenticated(): void {
    this.loadingSubject.next(true);

    authState(this.auth).subscribe((user) => {
      this.userSubject.next(user ?? undefined);
      this.loadingSubject.next(false);

      console.log('AUTH STATE WAS CHANGED');
    });
  }

  checkUsername(username: string): Observable<boolean> {
    const usernameDoc = doc(this.fs, 'usernames', username);

    return from(getDoc(usernameDoc)).pipe(map((user) => user.exists()));
  }
}
