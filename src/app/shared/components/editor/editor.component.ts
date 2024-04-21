import {
  Component,
  DestroyRef,
  EventEmitter,
  Input,
  OnInit,
  Output,
  forwardRef,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  NG_VALUE_ACCESSOR,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CodeService } from '@core/services/code.service';
import { ICodeItem } from '@shared/models/snippet.interface';
import { MonacoEditorModule } from 'ngx-monaco-editor-v2';

@Component({
  selector: 'app-editor',
  standalone: true,
  imports: [MonacoEditorModule, ReactiveFormsModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => EditorComponent),
      multi: true,
    },
  ],
  templateUrl: './editor.component.html',
  styleUrl: './editor.component.scss',
})
export class EditorComponent implements OnInit {
  @Input({ required: true }) options: unknown;
  @Input() readonly: boolean = false;

  form!: FormGroup<{
    code: FormControl<string>;
    language: FormControl<string>;
  }>;

  onChange: any = () => {};
  onTouched: any = () => {};
  disabled: boolean = false;

  constructor(
    private fb: FormBuilder,
    private codeService: CodeService,
    private destroyRef: DestroyRef,
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.formValuesChanges();
  }

  private initForm(): void {
    this.form = this.fb.group({
      code: this.fb.control('', {
        nonNullable: true,
        validators: [Validators.required],
      }),
      language: this.fb.control('', {
        nonNullable: true,
        validators: [Validators.required],
      }),
    });
  }

  private formValuesChanges(): void {
    this.form.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((value) => {
        if (!value.code || !value.language) {
          return;
        }

        this.onChange({
          code: this.formatRawCode(value.code),
          language: value.language,
        });
      });
  }

  private formatRawCode(code: string): string {
    return this.codeService.formatRawCode(code);
  }

  writeValue(value: ICodeItem): void {
    this.form.setValue(value);
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    if (isDisabled) {
      this.form.disable();
    } else {
      this.form.enable();
    }
  }
}
