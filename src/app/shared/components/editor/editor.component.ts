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
import { MonacoEditorModule } from 'ngx-monaco-editor-v2';
import { languages } from '@shared/helpers/supported-languages';
import { DropdownModule } from 'primeng/dropdown';
import { ButtonModule } from 'primeng/button';
import { SharedService } from '@core/services/shared.service';
import { IEditorOptions } from '@shared/models/editor.interface';

@Component({
  selector: 'app-editor',
  standalone: true,
  imports: [MonacoEditorModule, DropdownModule, ButtonModule, FormsModule],
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

  options = input.required<IEditorOptions>();
  readonly = input<boolean>(false);
  height = input<string>('300px');

  editorOptions = computed<IEditorOptions>(() => ({
    ...this.options(),
    language: this.language() ?? '',
  }));

  language = model<string>();
  code = model<string>();

  disabled = signal<boolean>(false);

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

  private formatRawCode(code: string | undefined): string {
    return code ? this.sharedService.formatRawCode(code) : '';
  }

  onDelete(): void {
    this.deleteEditor.emit();
  }

  writeValue(value: ICodeItem): void {
    this.language.set(value.language);
    this.code.set(value.code);
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
