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
  private route = inject(ActivatedRoute);
  private destroyRef = inject(DestroyRef);
  private firestoreService = inject(FirestoreService);
  private authService = inject(AuthService);

  snippets = signal<ISnippetPreview[] | undefined>(undefined);
  isOwner = signal<boolean>(false);

  user$ = this.authService.user$;

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

          return userId
            ? this.firestoreService.getUserSnippets(userId, owner)
            : EMPTY;
        }),
      )
      .subscribe((snippets) => {
        this.snippets.set(snippets);
      });
  }
}
