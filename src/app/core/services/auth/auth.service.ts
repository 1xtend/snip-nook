import { Injectable, signal } from '@angular/core';
import { Auth, authState, User } from '@angular/fire/auth';
import { Firestore, getDoc, doc } from '@angular/fire/firestore';
import { Observable, from, map } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  loading = signal<boolean>(false);
  user = signal<User | undefined>(undefined);

  constructor(
    public auth: Auth,
    private fs: Firestore,
  ) {}

  checkIfUserIsAuthenticated(): void {
    this.loading.set(true);

    authState(this.auth).subscribe((user) => {
      this.user.set(user ?? undefined);
      this.loading.set(false);
    });
  }

  checkUsername(username: string): Observable<boolean> {
    const usernameDoc = doc(this.fs, 'usernames', username);

    return from(getDoc(usernameDoc)).pipe(map((user) => user.exists()));
  }
}
