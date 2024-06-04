import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  forwardRef,
  inject,
  input,
  model,
  output,
  signal,
} from '@angular/core';
import { FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';
import { ICodeItem } from '@shared/models/snippet.interface';
import { languages } from '@shared/helpers/supported-languages';
import { DropdownModule } from 'primeng/dropdown';
import { SkeletonModule } from 'primeng/skeleton';
import { ButtonModule } from 'primeng/button';
import { SharedService } from '@core/services/shared.service';
import {
  MonacoEditorComponent,
  NgEditorOptions,
} from '@1xtend/ng-monaco-editor';

@Component({
  selector: 'app-editor',
  standalone: true,
  imports: [
    MonacoEditorComponent,
    DropdownModule,
    ButtonModule,
    FormsModule,
    SkeletonModule,
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
export class EditorComponent {
  private sharedService = inject(SharedService);

  deleteEditor = output<void>();

  options = input.required<NgEditorOptions>();
  readonly = input<boolean>(false);
  height = input<string>('300px');

  editorOptions = computed<NgEditorOptions>(() => ({
    ...this.options(),
    language: this.language() || 'plaintext',
  }));

  language = model<string>();
  code = model<string>();

  disabled = signal<boolean>(false);
  loading = signal<boolean>(false);

  languagesList = languages;

  onChange: any = () => {};
  onTouched: any = () => {};

  constructor() {
    effect(() => {
      this.onChange({
        language: this.language(),
        code: this.formatRawCode(this.code()),
      });
    });
  }

  setLoading(value: boolean): void {
    this.loading.set(value);
  }

  private formatRawCode(code: string | undefined): string {
    return code ? this.sharedService.formatRawCode(code) : '';
  }

  onDelete(): void {
    this.deleteEditor.emit();
  }

  writeValue({ language, code }: ICodeItem): void {
    this.language.set(language);
    this.code.set(code);
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    this.disabled.set(isDisabled);
  }
}
