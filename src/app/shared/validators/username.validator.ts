import {
  AbstractControl,
  AsyncValidatorFn,
  ValidationErrors,
} from '@angular/forms';
import { AuthService } from '@core/services/auth.service';
import { Observable, map, of, take } from 'rxjs';

export function usernameValidator(authService: AuthService): AsyncValidatorFn {
  return (control: AbstractControl): Observable<ValidationErrors | null> => {
    if (!control.value) {
      return of(null);
    }

    return authService.checkUsername(control.value).pipe(
      take(1),
      map((exist) => {
        return exist ? { usernameExists: true } : null;
      }),
    );
  };
}
