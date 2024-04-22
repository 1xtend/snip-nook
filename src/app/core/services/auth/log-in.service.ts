import { Injectable } from '@angular/core';
import { Auth, signInWithEmailAndPassword } from '@angular/fire/auth';
import { IAuthData } from '@shared/models/auth.interface';
import { catchError, from, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class LogInService {
  constructor(private auth: Auth) {}

  logIn({ email, password }: IAuthData) {
    return from(signInWithEmailAndPassword(this.auth, email, password)).pipe(
      catchError((err) =>
        throwError(() => new Error(`Login failed: ${err.message}`)),
      ),
    );
  }
}
