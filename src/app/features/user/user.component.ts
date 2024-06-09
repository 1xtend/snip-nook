import { ModalService } from '@core/services/modal.service';
import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterOutlet } from '@angular/router';
import { AuthService } from '@core/services/auth.service';
import {
  EMPTY,
  combineLatest,
  finalize,
  shareReplay,
  switchMap,
  take,
  tap,
} from 'rxjs';
import { TabMenuModule } from 'primeng/tabmenu';
import { MenuItem } from 'primeng/api';
import { SkeletonModule } from 'primeng/skeleton';
import { AvatarComponent } from '@shared/components/avatar/avatar.component';
import { ImageDialogComponent } from '@shared/components/image-dialog/image-dialog.component';
import { UserService } from '@core/services/user.service';

@Component({
  selector: 'app-user',
  standalone: true,
  imports: [TabMenuModule, RouterOutlet, SkeletonModule, AvatarComponent],
  templateUrl: './user.component.html',
  styleUrl: './user.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserComponent implements OnInit {
  public route = inject(ActivatedRoute);
  private authService = inject(AuthService);
  private userService = inject(UserService);
  private modalService = inject(ModalService);

  loading = signal<boolean>(false);
  owner = signal<boolean>(false);
  tabItems = computed<MenuItem[]>(() => {
    return this.getTabItems(this.owner());
  });

  private user$ = this.authService.user$;

  user = toSignal(
    combineLatest({
      params: this.route.paramMap,
      user: this.user$,
    }).pipe(
      takeUntilDestroyed(),
      tap(() => {
        this.loading.set(true);
      }),
      switchMap(({ params, user }) => {
        const userId = params.get('id');
        this.owner.set(user?.uid === userId);

        return userId ? this.userService.getUser(userId).pipe(take(1)) : EMPTY;
      }),
      shareReplay(1),
      finalize(() => {
        this.loading.set(false);
      }),
    ),
  );

  ngOnInit(): void {
    this.loading.set(true);
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

  onAvatarClick(): void {
    this.modalService.showDialog(ImageDialogComponent, {
      data: {
        src: this.user()?.photoURL,
        alt: this.user()?.username,
      },
      width: 'auto',
      header: `${this.user()?.username}'s avatar`,
      styleClass: 'image-dialog',
      breakpoints: null,
    });
  }
}
