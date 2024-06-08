import { ConfirmationService, MessageService } from 'primeng/api';
import { SnippetService } from '../../core/services/snippet.service';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  effect,
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
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { EditorComponent } from '@shared/components/editor/editor.component';
import { ActivatedRoute, Router } from '@angular/router';
import { codeEditorValidator } from '@shared/validators/code-editor.validator';
import {
  EMPTY,
  Observable,
  catchError,
  combineLatest,
  distinctUntilChanged,
  filter,
  map,
  shareReplay,
  switchMap,
  take,
  tap,
} from 'rxjs';
import { ActionType } from '@shared/models/action.type';
import { ThemeService } from '@core/services/theme.service';
import { NgEditorOptions } from '@1xtend/ng-monaco-editor';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
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
    ConfirmDialogModule,
  ],
  providers: [ConfirmationService],
  templateUrl: './snippet-action.component.html',
  styleUrl: './snippet-action.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SnippetActionComponent {
  private fb = inject(FormBuilder);
  private snippetService = inject(SnippetService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);
  private themeService = inject(ThemeService);
  private destroyRef = inject(DestroyRef);

  form: FormGroup<ISnippetActionForm> = this.fb.group<ISnippetActionForm>({
    name: this.fb.control('', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(60)],
    }),
    public: this.fb.control(false, {
      nonNullable: true,
    }),
    description: this.fb.control('', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(600)],
    }),
    code: this.fb.array<FormControl<ICodeItem>>([], {
      validators: [codeEditorValidator()],
    }),
  });

  action = signal<ActionType>('create');
  loading = signal<boolean>(false);
  hasChanged = signal<boolean>(false);

  activeTheme = toSignal(this.themeService.activeTheme$);
  options = computed<NgEditorOptions>(() => ({
    theme:
      !this.activeTheme() || this.activeTheme() === 'dark'
        ? 'vs-dark'
        : 'vs-light',
  }));

  snippet = toSignal(
    combineLatest({
      params: this.route.paramMap,
      data: this.route.data,
    }).pipe(
      takeUntilDestroyed(),
      tap(({ data }) => {
        this.action.set(data['action'] || 'create');
      }),
      filter(({ data }) => data['action'] !== 'create'),
      switchMap(({ params }) => {
        const snippetId = params.get('id');

        this.loading.set(true);
        this.form.disable();

        return snippetId
          ? this.snippetService.getSnippet(snippetId).pipe(take(1))
          : EMPTY;
      }),
      map((result) => result.snippet),
      catchError((err) => {
        this.loading.set(false);
        this.form.enable();

        return EMPTY;
      }),
      tap((snippet) => {
        console.log('Snippet', snippet);
        this.loading.set(false);
        this.form.enable();
      }),
      shareReplay(1),
    ),
  );

  get codeArrayControl(): FormArray<FormControl> {
    return this.form.controls['code'];
  }

  constructor() {
    effect(() => {
      const snippet = this.snippet();

      if (snippet) {
        this.setFormValue(snippet);
      }
    });
  }

  private setFormValue(snippet: ISnippet): void {
    this.form.patchValue({
      name: snippet.name,
      description: snippet.description,
      public: snippet.public,
    });

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

    this.hasFormChanged();
  }

  private hasFormChanged(): void {
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
    if (this.form.invalid || !this.hasChanged()) {
      this.form.markAllAsTouched();
      return;
    }

    this.form.disable();

    const value = this.form.getRawValue();
    const snippet: ISnippet = this.getSnippet(value);

    this.handleSnippet(snippet);
  }

  private handleSnippet(snippet: ISnippet): void {
    this.getSnippetAction(snippet)
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

  private getSnippetAction(snippet: ISnippet): Observable<ISnippet> {
    return this.action() === 'create'
      ? this.snippetService.createSnippet(snippet)
      : this.snippetService.editSnippet(snippet);
  }

  addEditor(): void {
    this.codeArrayControl.push(
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
    if (this.action() !== 'edit') {
      return;
    }

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
    const snippet = this.snippet();

    if (!snippet) {
      return;
    }

    this.form.disable();

    this.handleDelete(snippet);
  }

  private handleDelete(snippet: ISnippet): void {
    this.snippetService
      .deleteSnippet(snippet.uid)
      .pipe(take(1))
      .subscribe({
        next: () => {
          this.form.reset();
          this.form.enable();

          this.messageService.add({
            severity: 'success',
            detail: 'Snippet was successfully deleted.',
            summary: 'Success',
          });
          this.router.navigate(['/user', snippet.author.uid, 'snippets']);
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
