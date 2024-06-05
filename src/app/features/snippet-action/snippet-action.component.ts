import { ConfirmationService, MessageService } from 'primeng/api';
import { SnippetService } from '../../core/services/snippet.service';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  DestroyRef,
  OnInit,
  Signal,
  computed,
  inject,
  signal,
} from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  ICodeItem,
  ISnippet,
  ISnippetActionForm,
} from '@shared/models/snippet.interface';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { CheckboxModule } from 'primeng/checkbox';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { IconFieldModule } from 'primeng/iconfield';
import { SkeletonModule } from 'primeng/skeleton';
import { InputIconModule } from 'primeng/inputicon';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { EditorComponent } from '@shared/components/editor/editor.component';
import { ActivatedRoute, Data, ParamMap, Router } from '@angular/router';
import { codeEditorValidator } from '@shared/validators/code-editor.validator';
import {
  EMPTY,
  Observable,
  combineLatest,
  distinctUntilChanged,
  finalize,
  map,
  of,
  switchMap,
  take,
  throwError,
} from 'rxjs';
import { ActionType } from '@shared/models/action.type';
import { AuthService } from '@core/services/auth.service';
import { ThemeService } from '@core/services/theme.service';
import { User } from 'firebase/auth';
import { NgEditorOptions } from '@1xtend/ng-monaco-editor';
import {
  takeUntilDestroyed,
  toObservable,
  toSignal,
} from '@angular/core/rxjs-interop';
import { FormFocusDirective } from '@shared/directives/form-focus.directive';
import { hasFormChanged } from '@shared/helpers/has-form-changed.operator';

@Component({
  selector: 'app-snippet-create',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    InputTextModule,
    InputTextareaModule,
    CheckboxModule,
    ButtonModule,
    EditorComponent,
    DividerModule,
    SkeletonModule,
    ConfirmDialogModule,
  ],
  providers: [ConfirmationService],
  templateUrl: './snippet-action.component.html',
  styleUrl: './snippet-action.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SnippetActionComponent implements OnInit {
  private fb = inject(FormBuilder);
  private snippetService = inject(SnippetService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private messageService = inject(MessageService);
  private authService = inject(AuthService);
  private confirmationService = inject(ConfirmationService);
  private themeService = inject(ThemeService);
  private destroyRef = inject(DestroyRef);
  private cdr = inject(ChangeDetectorRef);

  form!: FormGroup<ISnippetActionForm>;

  snippet = signal<ISnippet | undefined>(undefined);
  action = signal<ActionType>('create');
  loading = signal<boolean>(false);
  hasChanged = signal<boolean>(false);

  activeTheme = toSignal(this.themeService.activeTheme$);
  editorOptions = computed<NgEditorOptions>(() => ({
    minimap: {
      enabled: false,
    },
    theme:
      !this.activeTheme() || this.activeTheme() === 'dark'
        ? 'vs-dark'
        : 'vs-light',
  }));

  get codeArrayControl(): FormArray<FormControl> {
    return this.form.controls['code'];
  }

  ngOnInit(): void {
    this.initForm();

    this.paramsChanges();
  }

  private paramsChanges(): void {
    combineLatest({
      params: this.route.paramMap,
      data: this.route.data,
    })
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        switchMap(({ params, data }) => {
          const action = data['action'] || 'create';
          this.action.set(action);

          if (action === 'create') {
            return of(undefined);
          }

          const snippetId = params.get('id');

          if (!snippetId) {
            throw new Error("Current route doesn't contain snippet uid");
          }

          this.loading.set(true);
          this.form.disable();

          return this.snippetService.getSnippet(snippetId).pipe(take(1));
        }),
      )
      .subscribe({
        next: (snippet) => {
          this.snippet.set(snippet);

          if (snippet) {
            this.initForm(snippet);
            this.loading.set(false);
            this.form.enable();
            this.cdr.markForCheck();
          }
        },
        error: () => {
          this.loading.set(false);
          this.form.enable();
        },
      });
  }

  private initForm(snippet?: ISnippet): void {
    this.form = this.fb.group<ISnippetActionForm>({
      name: this.fb.control(snippet?.name || '', {
        nonNullable: true,
        validators: [Validators.required, Validators.maxLength(60)],
      }),
      public: this.fb.control(snippet?.public || false, {
        nonNullable: true,
      }),
      description: this.fb.control(snippet?.description || '', {
        nonNullable: true,
        validators: [Validators.required, Validators.maxLength(600)],
      }),
      code: this.fb.array<FormControl<ICodeItem>>([], {
        validators: [codeEditorValidator()],
      }),
    });

    if (snippet) {
      const controlsArray: FormArray<FormControl<ICodeItem>> = this.fb.array(
        snippet.code.map((item) =>
          this.fb.control(item, {
            nonNullable: true,
            validators: [Validators.required],
          }),
        ),
        { validators: [codeEditorValidator()] },
      );

      this.form.setControl('code', controlsArray);

      this.checkFormChange();
    }
  }

  private checkFormChange(): void {
    const initialValue = this.form.getRawValue();

    this.form.valueChanges
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        hasFormChanged(initialValue),
        distinctUntilChanged(),
      )
      .subscribe((changed) => {
        this.hasChanged.set(changed);
      });
  }

  onSubmit(): void {
    if (this.form.invalid && this.hasChanged()) {
      this.form.markAllAsTouched();
      return;
    }

    this.form.disable();

    const value = this.form.getRawValue();
    const snippet: ISnippet = this.getSnippet(value);

    this.handleSnippet(snippet)
      .pipe(take(1))
      .subscribe({
        next: (snippet) => {
          this.form.reset();
          this.form.enable();
          this.messageService.add({
            severity: 'success',
            detail: `Snippet was ${this.action() === 'create' ? 'created' : 'edited'} successfully`,
            summary: 'Success',
          });
          this.router.navigate(['snippet', snippet.uid, 'overview']);
        },
        error: () => {
          this.form.enable();
        },
      });
  }

  private handleSnippet(snippet: ISnippet): Observable<ISnippet> {
    return this.action() === 'create'
      ? this.snippetService.createSnippet(snippet)
      : this.snippetService.editSnippet(snippet);
  }

  addEditor(): void {
    // this.codeArrayControl.push(
    //   this.fb.control<ICodeItem>(
    //     { language: '', code: '' },
    //     { nonNullable: true, validators: [Validators.required] },
    //   ),
    // );

    this.form.controls['code'].push(
      this.fb.control<ICodeItem>(
        { language: '', code: '' },
        { nonNullable: true, validators: [Validators.required] },
      ),
    );
  }

  deleteEditor(index: number): void {
    this.codeArrayControl.removeAt(index);
  }

  confirmDeletion(e: Event): void {
    this.confirmationService.confirm({
      target: e.target as EventTarget,
      message: 'Do you want to delete this snippet?',
      header: 'Delete Confirmation',
      icon: 'pi pi-exclamation-triangle',
      acceptIcon: 'none',
      rejectIcon: 'none',
      acceptButtonStyleClass: 'p-button-danger p-button-outlined',
      rejectButtonStyleClass: 'p-button-outlined',
      accept: () => {
        this.deleteSnippet();
      },
      reject: () => {
        this.confirmationService.close();
      },
    });
  }

  private deleteSnippet(): void {
    const uid = this.snippet()?.uid;

    if (!uid) {
      return;
    }

    this.form.disable();

    this.authService.user$
      .pipe(
        take(1),
        switchMap((user) => {
          return user
            ? this.snippetService.deleteSnippet(uid).pipe(
                take(1),
                map(() => user),
              )
            : EMPTY;
        }),
      )
      .subscribe({
        next: (user) => {
          this.form.reset();
          this.form.enable();

          this.messageService.add({
            severity: 'success',
            detail: 'Snippet was successfully deleted.',
            summary: 'Success',
          });
          this.router.navigate(['/user', user.uid, 'snippets']);
        },
        error: () => {
          this.form.enable();
        },
      });
  }

  private getSnippet(value: ReturnType<typeof this.form.getRawValue>) {
    return {
      author: {
        name: this.snippet()?.author.name.trim() || '',
        uid: this.snippet()?.author.uid || '',
      },
      code: value.code,
      description: value.description.trim(),
      name: value.name.trim(),
      public: value.public,
      uid: this.snippet()?.uid || '',
    };
  }
}
