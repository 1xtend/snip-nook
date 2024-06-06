import { SharedService } from './../../core/services/shared.service';
import { combineLatest, switchMap, take, throwError } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit,
  computed,
  inject,
  model,
  signal,
} from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { ICodeItem, ISnippet } from '@shared/models/snippet.interface';
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
  private destroyRef = inject(DestroyRef);
  private sharedService = inject(SharedService);
  private themeService = inject(ThemeService);

  private activeTheme = toSignal(this.themeService.activeTheme$);
  private language = signal<string>('plaintext');
  snippet = signal<ISnippet | undefined>(undefined);
  isOwner = signal<boolean>(false);

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
        switchMap(({ user, params }) => {
          this.loading.set(true);

          const snippetId = params.get('id');
          const userId = user?.uid;

          if (!snippetId) {
            return throwError(
              () => new Error("Current route doesn't contain snippet uid"),
            );
          }

          return this.snippetService
            .getSnippet(snippetId, userId)
            .pipe(take(1));
        }),
      )
      .subscribe({
        next: ({ snippet, owner }) => {
          this.loading.set(false);
          this.snippet.set(snippet);
          this.isOwner.set(owner);

          if (snippet) {
            this.tabItems = this.getTabItems(snippet.code);
            this.activeTab = this.tabItems[0];
            this.setTabCode(snippet.code[0]);
          }
        },
        error: () => {
          this.loading.set(false);
        },
      });
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
