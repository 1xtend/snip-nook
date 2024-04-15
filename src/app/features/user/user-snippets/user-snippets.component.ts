import { FirestoreService } from '@core/services/firestore.service';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import {
  BehaviorSubject,
  EMPTY,
  Subject,
  combineLatest,
  first,
  switchMap,
  take,
} from 'rxjs';
import { ISnippetPreview } from '@shared/models/snippet.interface';
import { AsyncPipe } from '@angular/common';
import { DividerModule } from 'primeng/divider';
import { SnippetCardComponent } from '@shared/components/snippet-card/snippet-card.component';
import { AuthService } from '@core/services/auth.service';

@Component({
  selector: 'app-user-snippets',
  standalone: true,
  imports: [AsyncPipe, DividerModule, SnippetCardComponent],
  templateUrl: './user-snippets.component.html',
  styleUrl: './user-snippets.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserSnippetsComponent implements OnInit {
  private snippetsSubject = new BehaviorSubject<ISnippetPreview[]>([]);
  snippets$ = this.snippetsSubject.asObservable();

  private isOwnerSubject = new BehaviorSubject<boolean>(false);
  isOwner$ = this.isOwnerSubject.asObservable();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
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

          return userId
            ? this.firestoreService.getUserSnippets(userId, owner)
            : EMPTY;
        }),
      )
      .subscribe((snippets) => {
        console.log('***SNIPPETS PARAMS CHANGES***');

        this.snippetsSubject.next(snippets);
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
