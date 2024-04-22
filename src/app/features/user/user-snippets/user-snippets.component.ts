import { FirestoreService } from '@core/services/firestore.service';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject, EMPTY, combineLatest, switchMap } from 'rxjs';
import { ISnippetPreview } from '@shared/models/snippet.interface';
import { AsyncPipe } from '@angular/common';
import { SnippetCardComponent } from '@shared/components/snippet-card/snippet-card.component';
import { AuthService } from '@core/services/auth/auth.service';
import { SkeletonModule } from 'primeng/skeleton';

@Component({
  selector: 'app-user-snippets',
  standalone: true,
  imports: [AsyncPipe, SnippetCardComponent, SkeletonModule],
  templateUrl: './user-snippets.component.html',
  styleUrl: './user-snippets.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserSnippetsComponent implements OnInit {
  private snippetsSubject = new BehaviorSubject<ISnippetPreview[]>([]);
  snippets$ = this.snippetsSubject.asObservable();

  private isOwnerSubject = new BehaviorSubject<boolean>(false);
  isOwner$ = this.isOwnerSubject.asObservable();

  private loadingSubject = new BehaviorSubject<boolean>(false);
  loading$ = this.loadingSubject.asObservable();

  constructor(
    private route: ActivatedRoute,
    private destroyRef: DestroyRef,
    private firestoreService: FirestoreService,
    private authService: AuthService,
  ) {}

  ngOnInit(): void {
    this.paramsChanges();
    this.ownerChanges();
  }

  private paramsChanges(): void {
    combineLatest({
      params: this.route.parent?.paramMap ?? EMPTY,
      user: this.authService.user$,
    })
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        switchMap(({ params, user }) => {
          const userId = params.get('id');
          const owner = user?.uid === userId;

          this.isOwnerSubject.next(owner);
          this.loadingSubject.next(true);

          return userId
            ? this.firestoreService.getUserSnippets(userId, owner)
            : EMPTY;
        }),
      )
      .subscribe((snippets) => {
        console.log('***SNIPPETS PARAMS CHANGES***');

        this.snippetsSubject.next(snippets);
        this.loadingSubject.next(false);
      });
  }

  private ownerChanges(): void {
    this.isOwner$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((owner) => {
        console.log('IS OWNER: ', owner);
      });
  }
}
