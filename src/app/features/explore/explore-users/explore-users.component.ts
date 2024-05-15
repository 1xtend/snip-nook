import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { UserService } from '@core/services/user.service';
import { AvatarComponent } from '@shared/components/avatar/avatar.component';
import { IUser } from '@shared/models/user.interface';
import { SkeletonModule } from 'primeng/skeleton';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';
import { take } from 'rxjs';
import { Firestore, doc, docSnapshots } from '@angular/fire/firestore';

@Component({
  selector: 'app-explore-users',
  standalone: true,
  imports: [AvatarComponent, RouterLink, SkeletonModule, PaginatorModule],
  templateUrl: './explore-users.component.html',
  styleUrl: './explore-users.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExploreUsersComponent implements OnInit {
  private fs = inject(Firestore);
  private userService = inject(UserService);
  private destroyRef = inject(DestroyRef);

  private usersSignal = signal<IUser[]>([]);
  users = computed(this.usersSignal);

  loading = signal<boolean>(false);

  rows: number = 5;
  first: number = 0;
  count: number = 0;

  ngOnInit(): void {
    this.getUsers();
  }

  private getUsers(lastDoc: any = 0): void {
    this.loading.set(true);

    this.userService
      .getUsers(this.rows, 0)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (users) => {
          this.usersSignal.set(users);
          this.loading.set(false);
          console.log(users);
        },
        error: (err) => {
          this.loading.set(false);
        },
      });
  }

  onPageEvent(e: PaginatorState): void {
    this.first = e.first!;
    this.rows = e.rows!;

    console.log('page: ', e.page);
    console.log('rows: ', e.rows);
    console.log('first: ', e.first);
    console.log('pageCount: ', e.pageCount);

    // this.getUsers(lastDoc);
  }
}
