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
  ISnippetCreateForm,
} from '@shared/models/snippet.interface';
import { MonacoEditorModule } from 'ngx-monaco-editor-v2';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { CheckboxModule } from 'primeng/checkbox';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { EditorComponent } from '@shared/components/editor/editor.component';

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

  get codeArrayControl(): FormArray<FormControl> {
    return this.form.controls['code'];
  }

  constructor(
    private fb: FormBuilder,
    private firestoreService: FirestoreService,
  ) {}

  ngOnInit(): void {
    this.initForm();

    this.firestoreService.addSnippet({
      author: {
        name: 'test',
        uid: 'test',
      },
      code: [],
      description: 'descr',
      name: 'test',
      public: false,
      uid: '',
    });

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
