import { FirestoreService } from '@core/services/firestore.service';
import { SharedService } from './../../core/services/shared.service';
import { EMPTY, combineLatest, map, switchMap, take, throwError } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit,
  signal,
} from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { ICodeItem, ISnippet } from '@shared/models/snippet.interface';
import { SkeletonModule } from 'primeng/skeleton';
import { TabMenuModule } from 'primeng/tabmenu';
import { MenuItem } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { MonacoEditorModule } from 'ngx-monaco-editor-v2';
import { FormsModule } from '@angular/forms';
import { SnippetService } from '@core/services/snippet.service';

@Component({
  selector: 'app-snippet-overview',
  standalone: true,
  imports: [
    RouterLink,
    SkeletonModule,
    TabMenuModule,
    MonacoEditorModule,
    FormsModule,
    ButtonModule,
  ],
  templateUrl: './snippet-overview.component.html',
  styleUrl: './snippet-overview.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SnippetOverviewComponent implements OnInit {
  tabItems: MenuItem[] = [];
  activeTab: MenuItem | undefined = undefined;

  code: string = '';
  editorOptions = {
    language: '',
    minimap: {
      enabled: false,
    },
    contextmenu: false,
    readOnly: true,
    scrollBeyondLastLine: false,
  };

  snippet = signal<ISnippet | undefined>(undefined);
  isOwner = signal<boolean>(false);
  loading = signal<boolean>(false);

  user$ = toObservable(this.authService.user);

  constructor(
    private route: ActivatedRoute,
    private snippetService: SnippetService,
    private authService: AuthService,
    private destroyRef: DestroyRef,
    private sharedService: SharedService,
    private firestoreService: FirestoreService,
  ) {}

  ngOnInit(): void {
    this.paramsChanges();
  }

  private paramsChanges(): void {
    combineLatest({
      user: this.user$,
      params: this.route.paramMap,
    })
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        switchMap(({ user, params }) => {
          const snippetId = params.get('id');
          const userId = user?.uid;

          this.loading.set(true);

          if (!snippetId) {
            return throwError(() => new Error('There is no snippet id'));
          }

          return userId
            ? this.firestoreService.checkUserSnippet(userId, snippetId).pipe(
                take(1),
                switchMap((snippet) => {
                  this.isOwner.set(!!snippet);

                  return this.snippetService
                    .getSnippet(snippetId)
                    .pipe(take(1));
                }),
              )
            : this.snippetService.getSnippet(snippetId).pipe(take(1));
        }),
      )
      .subscribe((snippet) => {
        this.snippet.set(snippet);
        this.loading.set(false);

        if (snippet) {
          this.tabItems = this.getTabItems(snippet.code);
          this.activeTab = this.tabItems[0];
          this.setTabCode(snippet.code[0]);
        }
      });
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
    this.editorOptions = {
      ...this.editorOptions,
      language: item.language,
    };
  }
}
