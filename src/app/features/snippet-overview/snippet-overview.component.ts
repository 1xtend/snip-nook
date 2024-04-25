import { SharedService } from './../../core/services/shared.service';
import { EMPTY, combineLatest, map, switchMap } from 'rxjs';
import { AuthService } from '../../core/services/auth/auth.service';
import { FirestoreService } from './../../core/services/firestore.service';
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
import { MonacoEditorModule } from 'ngx-monaco-editor-v2';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-snippet-overview',
  standalone: true,
  imports: [
    RouterLink,
    SkeletonModule,
    TabMenuModule,
    MonacoEditorModule,
    FormsModule,
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
    private firestoreService: FirestoreService,
    private authService: AuthService,
    private destroyRef: DestroyRef,
    private sharedService: SharedService,
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
          this.loading.set(true);

          const snippetId = params.get('id');
          const userId = user?.uid;

          return snippetId && userId
            ? this.firestoreService.checkUserSnippet(userId, snippetId).pipe(
                map((owner) => {
                  this.isOwner.set(!!owner);

                  return { user, params };
                }),
              )
            : EMPTY;
        }),
        switchMap(({ user, params }) => {
          const snippetId = params.get('id');

          return snippetId
            ? this.firestoreService.getSnippet(snippetId)
            : EMPTY;
        }),
      )
      .subscribe((snippet) => {
        this.loading.set(false);
        this.snippet.set(snippet);

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
