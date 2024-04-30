import { FirestoreService } from '@core/services/firestore.service';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit,
  signal,
} from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { EMPTY, combineLatest, switchMap } from 'rxjs';
import { ISnippetPreview } from '@shared/models/snippet.interface';
import { SnippetCardComponent } from '@shared/components/snippet-card/snippet-card.component';
import { AuthService } from '@core/services/auth.service';
import { SkeletonModule } from 'primeng/skeleton';

@Component({
  selector: 'app-user-snippets',
  standalone: true,
  imports: [SnippetCardComponent, SkeletonModule],
  templateUrl: './user-snippets.component.html',
  styleUrl: './user-snippets.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserSnippetsComponent implements OnInit {
  snippets = signal<ISnippetPreview[]>([]);
  isOwner = signal<boolean>(false);
  loading = signal<boolean>(false);

  user$ = toObservable(this.authService.user);

  constructor(
    private route: ActivatedRoute,
    private destroyRef: DestroyRef,
    private firestoreService: FirestoreService,
    private authService: AuthService,
  ) {}

  ngOnInit(): void {
    this.paramsChanges();
  }

  private paramsChanges(): void {
    combineLatest({
      params: this.route.parent?.paramMap ?? EMPTY,
      user: this.user$,
    })
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        switchMap(({ params, user }) => {
          const userId = params.get('id');
          const owner = user?.uid === userId;

          this.isOwner.set(owner);
          this.loading.set(true);

          return userId
            ? this.firestoreService.getUserSnippets(userId, owner)
            : EMPTY;
        }),
      )
      .subscribe((snippets) => {
        console.log('***SNIPPETS PARAMS CHANGES***');
        this.snippets.set(snippets);
        this.loading.set(false);
      });
  }
}
