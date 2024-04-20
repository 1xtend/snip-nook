import { AsyncPipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ISnippetCreateForm } from '@shared/models/snippet.interface';
import { MonacoEditorModule } from 'ngx-monaco-editor-v2';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { CheckboxModule } from 'primeng/checkbox';

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
  ],
  templateUrl: './snippet-create.component.html',
  styleUrl: './snippet-create.component.scss',
})
export class SnippetCreateComponent implements OnInit {
  form!: FormGroup<ISnippetCreateForm>;

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.initForm();
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
      code: this.fb.control([], {
        nonNullable: true,
        validators: [Validators.required],
      }),
      description: this.fb.control('', {
        nonNullable: true,
        validators: [Validators.required],
      }),
    });
  }
}
