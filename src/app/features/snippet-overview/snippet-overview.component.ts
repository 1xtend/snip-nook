import { FirestoreService } from '@core/services/firestore.service';
import { SharedService } from './../../core/services/shared.service';
import { Observable, combineLatest, switchMap, take, throwError } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { ActivatedRoute, ParamMap, RouterLink } from '@angular/router';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { ICodeItem, ISnippet } from '@shared/models/snippet.interface';
import { SkeletonModule } from 'primeng/skeleton';
import { TabMenuModule } from 'primeng/tabmenu';
import { MenuItem } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { FormsModule } from '@angular/forms';
import { SnippetService } from '@core/services/snippet.service';
import { ThemeService } from '@core/services/theme.service';
import { User } from 'firebase/auth';
import {
  MonacoEditorComponent,
  NgEditorOptions,
} from '@1xtend/ng-monaco-editor';

@Component({
  selector: 'app-snippet-overview',
  standalone: true,
  imports: [
    RouterLink,
    SkeletonModule,
    TabMenuModule,
    FormsModule,
    ButtonModule,
    MonacoEditorComponent,
  ],
  templateUrl: './snippet-overview.component.html',
  styleUrl: './snippet-overview.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SnippetOverviewComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private snippetService = inject(SnippetService);
  private authService = inject(AuthService);
  private destroyRef = inject(DestroyRef);
  private sharedService = inject(SharedService);
  private firestoreService = inject(FirestoreService);
  private themeService = inject(ThemeService);

  // private defaultEditorOptions = signal<NgEditorOptions>(defaultEditorOptions);
  private activeTheme = toSignal(this.themeService.activeTheme$);

  tabItems: MenuItem[] = [];
  activeTab: MenuItem | undefined = undefined;

  code: string = '';
  editorOptions = computed<NgEditorOptions>(() => ({
    // ...this.defaultEditorOptions(),
    readOnly: true,
    theme:
      !this.activeTheme() || this.activeTheme() === 'dark'
        ? 'vs-dark'
        : 'vs-light',
    language: this.language(),
  }));
  private language = signal<string>('plaintext');

  snippet = signal<ISnippet | undefined>(undefined);
  isOwner = signal<boolean>(false);
  loading = signal<boolean>(false);

  user$ = this.authService.user$;

  ngOnInit(): void {
    this.paramsChanges();
  }

  private paramsChanges(): void {
    this.loading.set(true);

    combineLatest({
      user: this.user$,
      params: this.route.paramMap,
    })
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        switchMap(({ user, params }) => this.handleParamsChange(user, params)),
      )
      .subscribe({
        next: (snippet) => this.handleParamsNext(snippet),
        error: (err) => this.handleParamsError(err),
      });
  }

  private handleParamsChange(
    user: User | null,
    params: ParamMap,
  ): Observable<ISnippet | undefined> {
    this.loading.set(true);

    const snippetId = params.get('id');
    const userId = user?.uid;

    if (!snippetId) {
      return throwError(() => new Error('There is no snippet id'));
    }

    return userId
      ? this.firestoreService.checkSnippetOwner(userId, snippetId).pipe(
          switchMap((owner) => {
            this.isOwner.set(owner);

            return this.snippetService.getSnippet(snippetId).pipe(take(1));
          }),
        )
      : this.snippetService.getSnippet(snippetId);
  }

  private handleParamsNext(snippet: ISnippet | undefined): void {
    this.loading.set(false);
    this.snippet.set(snippet);

    if (snippet) {
      this.tabItems = this.getTabItems(snippet.code);
      this.activeTab = this.tabItems[0];
      this.setTabCode(snippet.code[0]);
    }
  }

  private handleParamsError(error: Error): void {
    this.loading.set(false);
  }

  private getTabItems(code: ICodeItem[]): MenuItem[] {
    return code.map((item) => {
      return {
        label: item.language,
        command: () => {
          this.setTabCode(item);
        },
      };
    });
  }

  private setTabCode(item: ICodeItem) {
    this.code = this.sharedService.formatProcessedCode(item.code);
    // this.defaultEditorOptions.update((prev) => ({
    //   ...prev,
    //   language: item.language,
    // }));
    this.language.set(item.language);
  }
}
