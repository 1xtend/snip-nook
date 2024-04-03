import { LoadingService } from './../../core/services/loading.service';
import { AsyncPipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterOutlet } from '@angular/router';
import { AuthService } from '@core/services/auth.service';
import { UserService } from '@core/services/user.service';
import { IUser } from '@shared/models/user.interface';
import { User } from 'firebase/auth';
import {
  BehaviorSubject,
  EMPTY,
  Observable,
  combineLatest,
  finalize,
  map,
  switchMap,
  take,
  tap,
} from 'rxjs';
import { TabMenuModule } from 'primeng/tabmenu';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'app-user',
  standalone: true,
  imports: [AsyncPipe, TabMenuModule, RouterOutlet],
  templateUrl: './user.component.html',
  styleUrl: './user.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserComponent implements OnInit {
  isOwner: boolean = false;
  tabItems: MenuItem[] | undefined = undefined;

  private userSubject = new BehaviorSubject<IUser | undefined>(undefined);
  user$ = this.userSubject.asObservable();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private destroyRef: DestroyRef,
    private userService: UserService,
    private loadingService: LoadingService,
  ) {}

  ngOnInit(): void {
    this.paramsChanges();

    this.tabItems = [
      {
        label: 'Snippets',
        icon: 'pi pi-fw pi-box',
      },
      {
        label: 'Saved',
        icon: 'pi pi-fw pi-bookmark',
      },
      {
        label: 'Settings',
        icon: 'pi pi-fw pi-cog',
      },
    ];
  }

  private paramsChanges(): void {
    this.loadingService.setLoading(true);

    combineLatest({
      params: this.route.paramMap,
      queryParams: this.route.queryParamMap,
      user: this.authService.user$,
    })
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        switchMap(({ params, queryParams, user }) => {
          const userId = params.get('id');

          this.isOwner = user?.uid === userId;
          console.log('Is owner: ', this.isOwner);

          return userId
            ? this.userService.getUser(userId).pipe(take(1))
            : EMPTY;
        }),
      )
      .subscribe({
        next: (user) => {
          console.log('Retrieved user: ', user);
          this.userSubject.next(user);
          this.loadingService.setLoading(false);
        },
        error: (err) => {
          console.log(err);
        },
      });
  }
}
