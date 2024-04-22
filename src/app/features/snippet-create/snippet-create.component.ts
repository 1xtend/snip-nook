import { MessageService } from 'primeng/api';
import { SnippetService } from './../../core/services/snippet.service';
import { FirestoreService } from '@core/services/firestore.service';
import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  ICodeItem,
  ISnippet,
  ISnippetCreateForm,
} from '@shared/models/snippet.interface';
import { MonacoEditorModule } from 'ngx-monaco-editor-v2';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { CheckboxModule } from 'primeng/checkbox';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { EditorComponent } from '@shared/components/editor/editor.component';
import { take } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'app-snippet-create',
  standalone: true,
  imports: [
    AsyncPipe,
    ReactiveFormsModule,
    InputTextModule,
    InputTextareaModule,
    MonacoEditorModule,
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
  form!: FormGroup<ISnippetCreateForm>;

  code: string = '';
  editorOptions = {
    language: 'html',
    minimap: {
      enabled: false,
    },
    contextmenu: false,
    scrollBeyondLastLine: false,
  };

  loading: boolean = false;

  get codeArrayControl(): FormArray<FormControl> {
    return this.form.controls['code'];
  }

  constructor(
    private fb: FormBuilder,
    private snippetService: SnippetService,
    private router: Router,
    private messageService: MessageService,
  ) {}

  ngOnInit(): void {
    this.initForm();

    this.form.valueChanges.subscribe((value) => {
      console.log(value);
    });
  }

  private initForm(): void {
    this.form = this.fb.group<ISnippetCreateForm>({
      name: this.fb.control('', {
        nonNullable: true,
        validators: [Validators.required],
      }),
      public: this.fb.control(false, {
        nonNullable: true,
      }),
      description: this.fb.control('', {
        nonNullable: true,
        validators: [Validators.required],
      }),
      code: this.fb.array<FormControl<ICodeItem>>([], {
        validators: [Validators.required],
      }),
    });
  }

  onSubmit(): void {
    if (!this.form.valid) {
      return;
    }

    this.form.disable();
    this.loading = true;

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
          this.form.enable();
          this.loading = false;
        },
        complete: () => {
          this.form.enable();
          this.loading = false;
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
