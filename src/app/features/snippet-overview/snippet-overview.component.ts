import { SharedService } from './../../core/services/shared.service';
import {
  EMPTY,
  catchError,
  combineLatest,
  map,
  shareReplay,
  switchMap,
  take,
  tap,
  throwError,
} from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  inject,
  model,
  signal,
} from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { ICodeItem } from '@shared/models/snippet.interface';
import { SkeletonModule } from 'primeng/skeleton';
import { TabMenuModule } from 'primeng/tabmenu';
import { MenuItem } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { FormsModule } from '@angular/forms';
import { SnippetService } from '@core/services/snippet.service';
import { ThemeService } from '@core/services/theme.service';
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
  private sharedService = inject(SharedService);
  private themeService = inject(ThemeService);

  private activeTheme = toSignal(this.themeService.activeTheme$);
  private language = signal<string>('plaintext');
  owner = signal<boolean>(false);

  loading = signal<boolean>(false);
  editorLoading = signal<boolean>(false);

  tabItems: MenuItem[] = [];
  activeTab: MenuItem | undefined = undefined;

  options = computed<NgEditorOptions>(() => ({
    language: this.language(),
    readOnly: true,
    theme:
      !this.activeTheme() || this.activeTheme() === 'dark'
        ? 'vs-dark'
        : 'vs-light',
  }));
  code = model<string>('');

  private user$ = this.authService.user$;

  snippet = toSignal(
    combineLatest({
      user: this.user$,
      params: this.route.paramMap,
    }).pipe(
      takeUntilDestroyed(),
      switchMap(({ user, params }) => {
        const snippetId = params.get('id');
        const userId = user?.uid;

        this.loading.set(true);

        if (!snippetId) {
          return throwError(
            () => new Error("Current route doesn't contain snippet id"),
          );
        }

        return this.snippetService.getSnippet(snippetId, userId).pipe(take(1));
      }),
      catchError(() => {
        this.loading.set(false);
        return EMPTY;
      }),
      tap(({ snippet, owner }) => {
        this.loading.set(false);
        this.owner.set(owner);

        if (snippet) {
          this.tabItems = this.getTabItems(snippet.code);
          this.activeTab = this.tabItems[0];
          this.setTabCode(snippet.code[0]);
        }
      }),
      map(({ snippet }) => snippet),
      shareReplay(1),
    ),
  );

  ngOnInit(): void {
    this.loading.set(true);
  }

  private getTabItems(code: ICodeItem[]): MenuItem[] {
    return code.map((item) => ({
      label: item.language,
      command: () => {
        this.setTabCode(item);
      },
    }));
  }

  private setTabCode(item: ICodeItem) {
    this.language.set(item.language);
    this.code.set(this.sharedService.formatProcessedCode(item.code));
  }
}
