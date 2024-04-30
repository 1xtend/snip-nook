import { MessageService } from 'primeng/api';
import { SnippetService } from './../../core/services/snippet.service';
import { AsyncPipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
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
import { EditorComponent } from '@shared/components/editor/editor.component';
import { Router } from '@angular/router';
import { codeEditorValidator } from '@shared/validators/code-editor.validator';
import { IEditorOptions } from '@shared/models/editor.interface';
import { take } from 'rxjs';

@Component({
  selector: 'app-snippet-create',
  standalone: true,
  imports: [
    AsyncPipe,
    ReactiveFormsModule,
    InputTextModule,
    InputTextareaModule,
    CheckboxModule,
    ButtonModule,
    EditorComponent,
    DividerModule,
  ],
  templateUrl: './snippet-create.component.html',
  styleUrl: './snippet-create.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SnippetCreateComponent implements OnInit {
  private fb = inject(FormBuilder);
  private snippetService = inject(SnippetService);
  private router = inject(Router);
  private messageService = inject(MessageService);

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

  get codeArrayControl(): FormArray<FormControl> {
    return this.form.controls['code'];
  }

  ngOnInit(): void {
    this.initForm();
  }

  private initForm(): void {
    this.form = this.fb.group<ISnippetCreateForm>({
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
  }

  onSubmit(): void {
    if (!this.form.valid) {
      return;
    }

    this.form.disable();

    const value = this.form.getRawValue();

    const snippet: ISnippet = {
      author: {
        name: '',
        uid: '',
      },
      code: value.code,
      description: value.description,
      name: value.name,
      public: value.public,
      uid: '',
    };

    this.snippetService
      .addSnippet(snippet)
      .pipe(take(1))
      .subscribe({
        next: (snippet) => {
          this.messageService.add({
            severity: 'success',
            detail: 'Snippet was created successfully',
            summary: 'Success',
          });

          this.router.navigate(['snippet', snippet.uid, 'overview']);
        },
        error: (err) => {
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
}
