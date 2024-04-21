import { FormArray, FormControl } from '@angular/forms';

export interface ISnippetPreview {
  description: string;
  name: string;
  uid: string;
  author: {
    name: string;
    uid: string;
  };
}

export interface ISnippet extends ISnippetPreview {
  code: ICodeItem[];
  public: boolean;
}

export interface ISnippetCreateForm {
  description: FormControl<string>;
  name: FormControl<string>;
  public: FormControl<boolean>;
  code: FormArray<FormControl<ICodeItem>>;
}

export interface ICodeItem {
  language: string;
  code: string;
}
