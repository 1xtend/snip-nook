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
import { IUser } from '@shared/models/user.interface';
import {
  BehaviorSubject,
  EMPTY,
  combineLatest,
  distinctUntilChanged,
  switchMap,
} from 'rxjs';
import { TabMenuModule } from 'primeng/tabmenu';
import { MenuItem } from 'primeng/api';
import { AvatarModule } from 'primeng/avatar';
import { SkeletonModule } from 'primeng/skeleton';
import { FirestoreService } from '@core/services/firestore.service';

@Component({
  selector: 'app-user',
  standalone: true,
  imports: [
    AsyncPipe,
    TabMenuModule,
    AsyncPipe,
    RouterOutlet,
    AvatarModule,
    SkeletonModule,
  ],
  templateUrl: './user.component.html',
  styleUrl: './user.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserComponent implements OnInit {
  tabItems: MenuItem[] = [];

  private loadingSubject = new BehaviorSubject<boolean>(false);
  loading$ = this.loadingSubject.asObservable();

  private userSubject = new BehaviorSubject<IUser | undefined>(undefined);
  user$ = this.userSubject.asObservable();

  private isOwnerSubject = new BehaviorSubject<boolean>(false);
  isOwner$ = this.isOwnerSubject.asObservable();

  constructor(
    public route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private destroyRef: DestroyRef,
    private firestoreService: FirestoreService,
  ) {}

  ngOnInit(): void {
    this.paramsChanges();
    this.ownerChanges();
  }

  private paramsChanges(): void {
    combineLatest({
      params: this.route.paramMap,
      user: this.authService.user$,
    })
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        switchMap(({ params, user }) => {
          const userId = params.get('id');

          this.loadingSubject.next(true);
          this.isOwnerSubject.next(user?.uid === userId);

          return userId ? this.firestoreService.getUser(userId) : EMPTY;
        }),
      )
      .subscribe((user) => {
        console.log('***PARAMS CHANGES***');

        this.userSubject.next(user);
        this.loadingSubject.next(false);
      });
  }

  private ownerChanges(): void {
    this.isOwner$
      .pipe(takeUntilDestroyed(this.destroyRef), distinctUntilChanged())
      .subscribe((owner) => {
        this.tabItems = this.getTabItems(owner);
      });
  }

  private getTabItems(owner: boolean): MenuItem[] {
    const tabItems = [
      {
        label: 'Overview',
        icon: 'pi pi-fw pi-book',
        routerLink: ['overview'],
      },
      {
        label: 'Snippets',
        icon: 'pi pi-fw pi-box',
        routerLink: ['snippets'],
      },
      {
        label: 'Saved',
        icon: 'pi pi-fw pi-bookmark',
        routerLink: ['saved'],
      },
    ];

    if (owner) {
      tabItems.push({
        label: 'Settings',
        icon: 'pi pi-fw pi-cog',
        routerLink: ['settings'],
      });
    }

    return tabItems;
  }
}
