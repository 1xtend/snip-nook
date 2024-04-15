import { FirestoreService } from '@core/services/firestore.service';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject, EMPTY, Subject, first, switchMap, take } from 'rxjs';
import { ISnippetPreview } from '@shared/models/snippet.interface';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-user-snippets',
  standalone: true,
  imports: [AsyncPipe],
  templateUrl: './user-snippets.component.html',
  styleUrl: './user-snippets.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserSnippetsComponent implements OnInit {
  private snippetsSubject = new BehaviorSubject<ISnippetPreview[]>([]);
  snippets$ = this.snippetsSubject.asObservable();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private destroyRef: DestroyRef,
    private firestoreService: FirestoreService,
  ) {}

  ngOnInit(): void {
    this.paramsChanges();
  }

  private paramsChanges(): void {
    this.route.parent?.paramMap
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        switchMap((params) => {
          const userId = params.get('id');

          console.log('User id: ', userId);

          return userId
            ? this.firestoreService.getUserSnippets(userId).pipe(take(1))
            : EMPTY;
        }),
      )
      .subscribe((snippets) => {
        console.log('USER SNIPPETS:', snippets);

        this.snippetsSubject.next(snippets);
      });
  }
}
