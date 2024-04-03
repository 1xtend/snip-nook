import { AsyncPipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '@core/services/auth.service';
import { UserService } from '@core/services/user.service';
import { IUser } from '@shared/models/user.interface';
import { User } from 'firebase/auth';
import {
  BehaviorSubject,
  EMPTY,
  Observable,
  combineLatest,
  map,
  switchMap,
  tap,
} from 'rxjs';

@Component({
  selector: 'app-user',
  standalone: true,
  imports: [AsyncPipe],
  templateUrl: './user.component.html',
  styleUrl: './user.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserComponent implements OnInit {
  isOwner: boolean = false;

  private userSubject = new BehaviorSubject<IUser | undefined>(undefined);
  user$ = this.userSubject.asObservable();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private destroyRef: DestroyRef,
    private userService: UserService,
  ) {}

  ngOnInit(): void {
    this.paramsChanges();
  }

  private paramsChanges(): void {
    combineLatest({
      params: this.route.paramMap,
      queryParams: this.route.queryParamMap,
      user: this.authService.user$,
    })
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        switchMap(({ params, queryParams, user }) => {
          const paramsId = params.get('id');

          this.isOwner = user?.uid === paramsId;

          return paramsId ? this.userService.getUser(paramsId) : EMPTY;
        }),
      )
      .subscribe((user) => {
        console.log('Retrieved user: ', user);
        this.userSubject.next(user);
      });
  }
}
