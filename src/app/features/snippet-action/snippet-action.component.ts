import { MessageService } from 'primeng/api';
import { SnippetService } from '../../core/services/snippet.service';
import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
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
  ISnippetCreateForm,
} from '@shared/models/snippet.interface';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { CheckboxModule } from 'primeng/checkbox';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { SkeletonModule } from 'primeng/skeleton';
import { EditorComponent } from '@shared/components/editor/editor.component';
import { ActivatedRoute, Router } from '@angular/router';
import { codeEditorValidator } from '@shared/validators/code-editor.validator';
import { IEditorOptions } from '@shared/models/editor.interface';
import { combineLatest, of, switchMap, take, throwError } from 'rxjs';
import { ActionType } from '@shared/models/action.type';
import { AuthService } from '@core/services/auth.service';

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
  ],
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

  form!: FormGroup<ISnippetCreateForm>;

  code: string = '';
  editorOptions: IEditorOptions = {
    language: 'plaintext',
    minimap: {
      enabled: false,
    },
    contextmenu: false,
    scrollBeyondLastLine: false,
  };

  private actionSignal = signal<ActionType>('create');
  action = computed(this.actionSignal);

  private snippetSignal = signal<ISnippet | undefined>(undefined);
  snippet = computed(this.snippetSignal);

  loading = signal<boolean>(false);

  get codeArrayControl(): FormArray<FormControl> {
    return this.form.controls['code'];
  }

  ngOnInit(): void {
    this.paramsChanges();
  }

  private paramsChanges(): void {
    this.loading.set(true);

    combineLatest({
      params: this.route.paramMap,
      data: this.route.data,
    })
      .pipe(
        switchMap(({ params, data }) => {
          const action: ActionType = data['action'] || 'create';

          this.actionSignal.set(action);
          this.loading.set(true);
          this.initForm(undefined);

          const snippetId = params.get('id');

          return action === 'create'
            ? of(undefined)
            : snippetId
              ? this.snippetService.getSnippet(snippetId)
              : throwError(
                  () => new Error("Route doesn't contain snippet uid"),
                );
        }),
      )
      .subscribe((snippet) => {
        this.initForm(snippet);

        this.snippetSignal.set(snippet);
        this.loading.set(false);
      });
  }

  private initForm(snippet: ISnippet | undefined): void {
    this.form = this.fb.group<ISnippetCreateForm>({
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
      const controlsArray: FormArray<FormControl<ICodeItem>> = new FormArray(
        snippet.code.map((snippet) =>
          this.fb.control(snippet, { nonNullable: true }),
        ),
      );

      this.form.setControl('code', controlsArray);
    }
  }

  onSubmit(): void {
    if (!this.form.valid) {
      return;
    }

    this.form.disable();

    const value = this.form.getRawValue();
    const snippet: ISnippet = this.getSnippet(value);

    this.handleSnippet(snippet)
      .pipe(take(1))
      .subscribe({
        next: (snippet) => {
          this.messageService.add({
            severity: 'success',
            detail: `Snippet was ${this.action() === 'create' ? 'created' : 'edited'} successfully`,
            summary: 'Success',
          });

          this.router.navigate(['snippet', snippet.uid, 'overview']);
        },
        error: (err) => {
          console.log(err);
          this.messageService.add({
            severity: 'error',
            detail: 'Unexpected error occurred. Try again later',
            summary: 'Error',
          });

          this.form.enable();
        },
        complete: () => {
          this.form.enable();
        },
      });
  }

  addEditor(): void {
    this.codeArrayControl.push(
      this.fb.control<ICodeItem>(
        { language: '', code: '' },
        { nonNullable: true },
      ),
    );
  }

  deleteEditor(index: number) {
    this.codeArrayControl.removeAt(index);
  }

  deleteSnippet(): void {
    const uid = this.snippet()?.uid;

    if (uid) {
      this.snippetService.deleteSnippet(uid).subscribe(() => {
        this.router.navigate(['/home']);
      });

      this.snippetService
        .deleteSnippet(uid)
        .pipe(
          switchMap(() => {
            return this.authService.user$;
          }),
        )
        .subscribe((user) => {
          if (!user) {
            this.router.navigate(['/home']);
            return;
          }

          this.router.navigate(['/user', user.uid, 'snippets']);
        });
    }
  }

  private handleSnippet(snippet: ISnippet) {
    return this.action() === 'create'
      ? this.snippetService.createSnippet(snippet)
      : this.snippetService.editSnippet(snippet);
  }

  private getSnippet(value: ReturnType<typeof this.form.getRawValue>) {
    return {
      author: {
        name: this.snippet()?.author.name || '',
        uid: this.snippet()?.author.uid || '',
      },
      code: value.code,
      description: value.description,
      name: value.name,
      public: value.public,
      uid: this.snippet()?.uid || '',
    };
  }
}
