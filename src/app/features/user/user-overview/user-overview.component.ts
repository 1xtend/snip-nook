import { DatePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { UserService } from '@core/services/user.service';
import { IUser } from '@shared/models/user.interface';
import { EMPTY, finalize, of, shareReplay, switchMap, take, tap } from 'rxjs';

@Component({
  selector: 'app-user-overview',
  standalone: true,
  imports: [DatePipe],
  templateUrl: './user-overview.component.html',
  styleUrl: './user-overview.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserOverviewComponent implements OnInit {
  private userService = inject(UserService);
  private route = inject(ActivatedRoute);

  loading = signal<boolean>(true);

  user = toSignal<IUser | undefined>(
    this.route.parent!.paramMap.pipe(
      takeUntilDestroyed(),
      switchMap((params) => {
        const userId = params.get('id');
        this.loading.set(true);
        console.log('userId', userId);
        console.log(this.route.snapshot.parent?.params);

        return userId
          ? this.userService.getUser(userId).pipe(
              take(1),
              tap((user) => {
                console.log('***user***', user);
              }),
            )
          : of(undefined);
      }),
      tap(() => {
        console.log('tap');
        this.loading.set(false);
      }),
      shareReplay(1),
    ),
  );

  ngOnInit(): void {
    // this.loading.set(true);
  }
}
