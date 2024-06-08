import { MessageService } from 'primeng/api';
import { FirestoreService } from '@core/services/firestore.service';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { EMPTY, Observable, combineLatest, switchMap } from 'rxjs';
import { ISnippetPreview } from '@shared/models/snippet.interface';
import { SnippetCardComponent } from '@shared/components/snippet-card/snippet-card.component';
import { AuthService } from '@core/services/auth.service';
import { SkeletonModule } from 'primeng/skeleton';
import { User } from 'firebase/auth';
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
  private destroyRef = inject(DestroyRef);
  private userService = inject(UserService);
  private authService = inject(AuthService);
  private messageService = inject(MessageService);

  snippets = signal<ISnippetPreview[]>([]);
  loading = signal<boolean>(false);
  isOwner = signal<boolean>(false);

  user$ = this.authService.user$;

  ngOnInit(): void {
    this.paramsChanges();
  }

  private paramsChanges(): void {
    this.loading.set(true);

    combineLatest({
      params: this.route.parent?.paramMap ?? EMPTY,
      user: this.user$,
    })
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        switchMap(({ params, user }) => this.handleParamsChange(params, user)),
      )
      .subscribe({
        next: (snippets) => this.handleParamsNext(snippets),
        error: (err) => this.handleParamsError(err),
      });
  }

  private handleParamsChange(
    params: ParamMap,
    user: User | null,
  ): Observable<ISnippetPreview[]> {
    const userId = params.get('id');
    const owner = user?.uid === userId;

    this.loading.set(true);
    this.isOwner.set(owner);

    return userId ? this.userService.getUserSnippets(userId, owner) : EMPTY;
  }

  private handleParamsNext(snippets: ISnippetPreview[]): void {
    this.loading.set(false);
    this.snippets.set(snippets);
  }

  private handleParamsError(error: Error): void {
    this.loading.set(false);
  }
}
