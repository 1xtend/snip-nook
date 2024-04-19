import { LoadingService } from './../../core/services/loading.service';
import { AuthService } from './../../core/services/auth.service';
import { FirestoreService } from '@core/services/firestore.service';
import {
  AfterViewInit,
  CUSTOM_ELEMENTS_SCHEMA,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  OnInit,
  ViewChild,
} from '@angular/core';
import { ICodeItem, ISnippet } from '@shared/models/snippet.interface';
import {
  BehaviorSubject,
  EMPTY,
  Subject,
  combineLatest,
  debounceTime,
  map,
  switchMap,
  take,
  timeout,
} from 'rxjs';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AsyncPipe } from '@angular/common';
import { TabMenuModule } from 'primeng/tabmenu';
import { MenuItem } from 'primeng/api';
import {
  EditorComponent,
  MonacoEditorModule,
  NgxEditorModel,
} from 'ngx-monaco-editor-v2';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-snippet',
  standalone: true,
  imports: [
    AsyncPipe,
    RouterLink,
    TabMenuModule,
    MonacoEditorModule,
    FormsModule,
  ],
  templateUrl: './snippet.component.html',
  styleUrl: './snippet.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SnippetComponent implements OnInit, AfterViewInit {
  @ViewChild('editor') editorRef!: EditorComponent;

  tabItems: MenuItem[] = [];

  private snippetSubject = new Subject<ISnippet | undefined>();
  snippet$ = this.snippetSubject.asObservable();

  private isOwnerSubject = new BehaviorSubject<boolean>(false);
  isOwner$ = this.isOwnerSubject.asObservable();

  model: NgxEditorModel = {
    language: '',
    uri: '',
    value: '',
  };

  code: string = '';

  options = {
    language: 'plaintext',
    minimap: {
      enabled: false,
    },
    contextmenu: false,
    readOnly: true,
  };

  constructor(
    private firestoreService: FirestoreService,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private destroyRef: DestroyRef,
    private loadingService: LoadingService,
  ) {}

  ngOnInit(): void {
    this.paramsChanges();

    // monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
    //   noSemanticValidation: true,
    //   noSyntaxValidation: true,
    // });
  }

  ngAfterViewInit(): void {
    console.log('EDITOR', this.editorRef);
  }

  private formatCode(code: string, backward: boolean = false) {
    return backward
      ? code.replace(/\\r\\n/g, '\r\n')
      : code.replace(/\r\n/g, '\\r\\n');
  }

  private paramsChanges(): void {
    combineLatest({
      params: this.route.paramMap,
      user: this.authService.user$,
    })
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        switchMap(({ params, user }) => {
          this.loadingService.setLoading(true);

          const snippetId = params.get('id');

          return user && snippetId
            ? this.firestoreService.checkUserSnippet(user.uid, snippetId).pipe(
                take(1),
                map((snippet) => {
                  this.isOwnerSubject.next(!!snippet);

                  console.log('*is owner*:', !!snippet);

                  return snippetId;
                }),
              )
            : EMPTY;
        }),
        switchMap((uid) => {
          return this.firestoreService.getSnippet(uid).pipe(take(1));
        }),
      )
      .subscribe((snippet) => {
        this.snippetSubject.next(snippet);

        console.log('snippet: ', snippet);

        this.loadingService.setLoading(false);
        this.tabItems = this.getTabItems(snippet?.code);
      });
  }

  private getTabItems(code: ICodeItem[] | undefined): MenuItem[] {
    return code
      ? code.map((item) => ({
          label: item.language,
          command: () => {
            this.showCodeModel(item);
          },
        }))
      : [];
  }

  private showCodeModel(item: ICodeItem) {
    this.model = {
      language: item.language,
      uri: 'main.json',
      value: item.code,
    };

    this.code = this.formatCode(item.code, true);

    this.options = {
      ...this.options,
      language: item.language,
    };
  }

  onEditorInit(e: object) {
    console.log('EDITOR INIT: ', e);
  }

  onEditorChange(e: string) {
    console.log(e);

    const formatted = this.formatCode(e);
    console.log(formatted);
  }
}
