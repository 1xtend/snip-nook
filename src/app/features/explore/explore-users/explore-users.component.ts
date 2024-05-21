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
import {
  DocumentData,
  Firestore,
  QueryDocumentSnapshot,
  doc,
  docSnapshots,
} from '@angular/fire/firestore';

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

  // Pagination
  readonly perPage: number = 2;
  first: number = 0;
  count: number = 0;

  private lastVisibleDoc: QueryDocumentSnapshot<DocumentData> | null = null;
  private firstVisibleDoc: QueryDocumentSnapshot<DocumentData> | null = null;
  isNextPageAvailable: boolean = true;
  private activePage: number = 0;
  private startAfterDoc: QueryDocumentSnapshot<DocumentData> | undefined =
    undefined;

  ngOnInit(): void {
    this.getUsers();
  }

  private getUsers(index: number = 0): void {
    console.log('Received index: ', index);

    this.loading.set(true);
    console.log(this.startAfterDoc);

    this.userService
      .getUsers(this.perPage, this.startAfterDoc)
      .pipe(take(1))
      .subscribe(({ users }) => {
        this.usersSignal.set(users);
        this.loading.set(false);

        // if (users.length > 0) {
        //   this.lastVisibleDoc = users[
        //     users.length - 1
        //   ] as unknown as QueryDocumentSnapshot<DocumentData>;
        //   this.firstVisibleDoc =
        //     users[0] as unknown as QueryDocumentSnapshot<DocumentData>;
        //   this.isNextPageAvailable = users.length === this.perPage;
        // } else {
        //   this.isNextPageAvailable = false;
        // }

        // this.usersSignal.set(users);
        // this.loading.set(false);
        // this.count = count;
        // console.log('Users', users);
      });

    // this.userService
    //   .getUsers(this.rows, 0)
    //   .pipe(takeUntilDestroyed(this.destroyRef))
    //   .subscribe({
    //     next: (users) => {
    //       this.usersSignal.set(users);
    //       this.loading.set(false);
    //       console.log(users);
    //     },
    //     error: (err) => {
    //       this.loading.set(false);
    //     },
    //   });
  }

  onPageEvent(e: PaginatorState): void {
    this.getUsers(e.page);
  }
}
