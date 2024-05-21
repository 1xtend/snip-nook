import { MessageService } from 'primeng/api';
import { Injectable, inject } from '@angular/core';
import { AuthErrorCodes } from 'firebase/auth';
import { Observable, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ErrorService {
  private messageService = inject(MessageService);

  handleError(error: Error) {
    const message = error.message;

    if (message.includes('auth')) {
      return this.handleAuthError(message);
    }

    this.messageService.add({
      severity: 'error',
      detail: message,
      summary: 'Auth Error',
      life: 4000,
    });

    return throwError(() => new Error(error.message));
  }

  private handleAuthError(message: string): Observable<never> {
    const start = message.indexOf('(') + 1;
    const end = message.indexOf(')');
    const errorCode = message.substring(start, end);
    console.log(errorCode);

    let errorMessage: string | undefined = undefined;

    switch (errorCode) {
      case AuthErrorCodes.INVALID_EMAIL:
        errorMessage = 'Email is invalid.';
        break;
      case AuthErrorCodes.INVALID_PASSWORD:
        errorMessage = 'Wrong password.';
        break;
      case AuthErrorCodes.USER_DELETED:
        errorMessage = 'User was not found.';
        break;
      case AuthErrorCodes.EMAIL_EXISTS:
        errorMessage = 'Email is already taken.';
        break;
      case AuthErrorCodes.WEAK_PASSWORD:
        errorMessage = 'Password should be at least 6 characters.';
        break;
      case AuthErrorCodes.INVALID_LOGIN_CREDENTIALS:
        errorMessage = 'Invalid email or password.';
        break;

      default:
        errorMessage = 'Unexpected error occured.';
        break;
    }

    this.messageService.add({
      severity: 'error',
      detail: errorMessage,
      summary: 'Auth Error',
      life: 4000,
    });

    return throwError(() => new Error(errorMessage));
  }
}
