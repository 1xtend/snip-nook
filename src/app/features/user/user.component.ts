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
  Subject,
  combineLatest,
  finalize,
  map,
  switchMap,
  take,
  tap,
} from 'rxjs';
import { TabMenuModule } from 'primeng/tabmenu';
import { MenuItem } from 'primeng/api';
import { TabType } from '@shared/models/tab.type';

@Component({
  selector: 'app-user',
  standalone: true,
  imports: [AsyncPipe, TabMenuModule],
  templateUrl: './user.component.html',
  styleUrl: './user.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserComponent implements OnInit {
  // isOwner: boolean = false;
  tabItems: MenuItem[] = [];

  private userSubject = new BehaviorSubject<IUser | undefined>(undefined);
  user$ = this.userSubject.asObservable();

  private isOwnerSubject = new BehaviorSubject<boolean>(false);
  isOwner$ = this.isOwnerSubject.asObservable();

  private activeTabSubject = new BehaviorSubject<MenuItem>({});
  activeTab$ = this.activeTabSubject.asObservable();

  activeItem: MenuItem | undefined = undefined;

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
    this.ownerChanges();
    this.tabsChanges();
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

          // this.isOwner = user?.uid === userId;
          this.isOwnerSubject.next(user?.uid === userId);

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

  private ownerChanges(): void {
    this.isOwner$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((owner) => {
        console.log('Is owner: ', owner);

        this.tabItems = this.getTabs(owner);
      });
  }

  private tabsChanges(): void {
    // this.activeTab$
    //   .pipe(takeUntilDestroyed(this.destroyRef))
    //   .subscribe((tab) => {
    //     console.log('Active tab: ', tab);
    //   });
  }

  private getTabs(owner: boolean): MenuItem[] {
    const tabs = [
      {
        label: 'Overview',
        icon: 'pi pi-fw pi-book',
        command: () => {
          this.router.navigate([], {
            relativeTo: this.route,
            queryParams: {
              tab: 'overview',
            },
          });
        },
      },
      {
        label: 'Snippets',
        icon: 'pi pi-fw pi-box',
        command: () => {
          this.router.navigate([], {
            relativeTo: this.route,
            queryParams: {
              tab: 'snippets',
            },
          });
        },
      },
      {
        label: 'Saved',
        icon: 'pi pi-fw pi-bookmark',
        command: () => {
          this.router.navigate([], {
            relativeTo: this.route,
            queryParams: {
              tab: 'saved',
            },
          });
        },
      },
    ];

    if (owner) {
      tabs.push({
        label: 'Settings',
        icon: 'pi pi-fw pi-cog',
        command: () => {
          this.router.navigate([], {
            relativeTo: this.route,
            queryParams: {
              tab: 'settings',
            },
          });
        },
      });
    }

    return tabs;
  }

  onActiveItemChange(e: MenuItem): void {
    console.log('tab click******');
    this.activeTabSubject.next(e);
  }
}
