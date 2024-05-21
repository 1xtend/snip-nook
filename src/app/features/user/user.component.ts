import { ModalService } from '@core/services/modal.service';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit,
  effect,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, ParamMap, RouterOutlet } from '@angular/router';
import { AuthService } from '@core/services/auth.service';
import { IUser } from '@shared/models/user.interface';
import { EMPTY, Observable, combineLatest, switchMap } from 'rxjs';
import { TabMenuModule } from 'primeng/tabmenu';
import { MenuItem } from 'primeng/api';
import { SkeletonModule } from 'primeng/skeleton';
import { FirestoreService } from '@core/services/firestore.service';
import { AvatarComponent } from '@shared/components/avatar/avatar.component';
import { ImageDialogComponent } from '@shared/components/image-dialog/image-dialog.component';
import { User } from 'firebase/auth';

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
  private destroyRef = inject(DestroyRef);
  private firestoreService = inject(FirestoreService);
  private modalService = inject(ModalService);

  tabItems: MenuItem[] = [];

  user = signal<IUser | undefined>(undefined);
  loading = signal<boolean>(false);
  isOwner = signal<boolean>(false);

  user$ = this.authService.user$;

  constructor() {
    effect(() => {
      this.tabItems = this.getTabItems(this.isOwner());
    });
  }

  ngOnInit(): void {
    this.paramsChanges();
  }

  private paramsChanges(): void {
    this.loading.set(true);

    combineLatest({
      params: this.route.paramMap,
      user: this.user$,
    })
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        switchMap(({ params, user }) => this.handleParamsChange(params, user)),
      )
      .subscribe({
        next: (user) => this.handleParamsNext(user),
        error: (err) => this.handleParamsError(err),
      });
  }

  private handleParamsChange(
    params: ParamMap,
    user: User | null,
  ): Observable<IUser | undefined> {
    const userId = params.get('id');

    this.loading.set(true);
    this.isOwner.set(user?.uid === userId);

    return userId ? this.firestoreService.getUser(userId) : EMPTY;
  }

  private handleParamsNext(user: IUser | undefined): void {
    this.user.set(user);
    this.loading.set(false);
  }

  private handleParamsError(error: Error): void {
    this.loading.set(false);
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
      header: `${this.user()?.username} avatar`,
      styleClass: 'image-dialog',
      breakpoints: null,
    });
  }
}
