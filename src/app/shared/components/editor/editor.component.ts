import {
  ChangeDetectionStrategy,
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
import { languages } from '@shared/helpers/supported-languages';
import { DropdownModule } from 'primeng/dropdown';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-editor',
  standalone: true,
  imports: [
    MonacoEditorModule,
    ReactiveFormsModule,
    DropdownModule,
    ButtonModule,
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => EditorComponent),
      multi: true,
    },
  ],
  templateUrl: './editor.component.html',
  styleUrl: './editor.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditorComponent implements OnInit {
  @Output() deleteEditor = new EventEmitter<void>();

  @Input({ required: true }) options: object = {};
  @Input() readonly: boolean = false;
  @Input() height: string = '300px';

  form!: FormGroup<{
    code: FormControl<string>;
    language: FormControl<string>;
  }>;

  languagesList = languages;

  onChange: any = () => {};
  onTouched: any = () => {};
  disabled: boolean = false;

  get languageControl(): FormControl {
    return this.form.controls['language'];
  }

  constructor(
    private fb: FormBuilder,
    private codeService: CodeService,
    private destroyRef: DestroyRef,
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.formValuesChanges();
    this.languageChanges();
  }

  private initForm(): void {
    this.form = this.fb.group({
      code: this.fb.control('', {
        nonNullable: true,
        validators: [Validators.required],
      }),
      language: this.fb.control('plaintext', {
        nonNullable: true,
        validators: [Validators.required],
      }),
    });
  }

  private formValuesChanges(): void {
    this.form.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(({ code, language }) => {
        if (!code || !language) {
          return;
        }

        this.onChange({
          code: this.formatRawCode(code),
          language,
        });
      });
  }

  private languageChanges(): void {
    this.languageControl.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((value) => {
        this.options = {
          ...this.options,
          language: value,
        };
      });
  }

  private formatRawCode(code: string): string {
    return this.codeService.formatRawCode(code);
  }

  onDelete(): void {
    this.deleteEditor.emit();
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
