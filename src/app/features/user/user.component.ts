import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit,
  signal,
} from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterOutlet } from '@angular/router';
import { AuthService } from '@core/services/auth.service';
import { IUser } from '@shared/models/user.interface';
import { EMPTY, combineLatest, distinctUntilChanged, switchMap } from 'rxjs';
import { TabMenuModule } from 'primeng/tabmenu';
import { MenuItem } from 'primeng/api';
import { AvatarModule } from 'primeng/avatar';
import { SkeletonModule } from 'primeng/skeleton';
import { FirestoreService } from '@core/services/firestore.service';

@Component({
  selector: 'app-user',
  standalone: true,
  imports: [TabMenuModule, RouterOutlet, AvatarModule, SkeletonModule],
  templateUrl: './user.component.html',
  styleUrl: './user.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserComponent implements OnInit {
  tabItems: MenuItem[] = [];

  user = signal<IUser | undefined>(undefined);
  isOwner = signal<boolean>(false);
  loading = signal<boolean>(false);

  user$ = toObservable(this.authService.user);
  isOwner$ = toObservable(this.isOwner);

  constructor(
    public route: ActivatedRoute,
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
      user: this.user$,
    })
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        switchMap(({ params, user }) => {
          const userId = params.get('id');

          this.loading.set(true);
          this.isOwner.set(user?.uid === userId);

          return userId ? this.firestoreService.getUser(userId) : EMPTY;
        }),
      )
      .subscribe((user) => {
        this.user.set(user);
        this.loading.set(false);
      });
  }

  private ownerChanges(): void {
    this.isOwner$.pipe(distinctUntilChanged()).subscribe((owner) => {
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
      tabItems.push(
        {
          label: 'Create snippet',
          icon: 'pi pi-fw pi-plus',
          routerLink: ['/snippet', 'create'],
        },
        {
          label: 'Settings',
          icon: 'pi pi-fw pi-cog',
          routerLink: ['settings'],
        },
      );
    }

    return tabItems;
  }
}
