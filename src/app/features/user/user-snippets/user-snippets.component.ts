import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import {
  EMPTY,
  combineLatest,
  finalize,
  map,
  shareReplay,
  switchMap,
  take,
  tap,
} from 'rxjs';
import { SnippetCardComponent } from '@shared/components/snippet-card/snippet-card.component';
import { AuthService } from '@core/services/auth.service';
import { SkeletonModule } from 'primeng/skeleton';
import { UserService } from '@core/services/user.service';

@Component({
  selector: 'app-user-snippets',
  standalone: true,
  imports: [SnippetCardComponent, SkeletonModule],
  templateUrl: './user-snippets.component.html',
  styleUrl: './user-snippets.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserSnippetsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private userService = inject(UserService);
  private authService = inject(AuthService);

  loading = signal<boolean>(false);
  owner = signal<boolean>(false);

  private user$ = this.authService.user$;

  snippets = toSignal(
    combineLatest({
      params: this.route.parent?.paramMap ?? EMPTY,
      user: this.user$,
    }).pipe(
      takeUntilDestroyed(),
      tap(() => {
        this.loading.set(true);
      }),
      map(({ params, user }) => {
        const userId = params.get('id');
        const owner = user?.uid === userId;

        this.owner.set(owner);

        return { userId, owner };
      }),
      switchMap(({ userId, owner }) => {
        return userId
          ? this.userService.getUserSnippets(userId, owner).pipe(take(1))
          : EMPTY;
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
}
