import { FormArray, FormControl } from '@angular/forms';

export interface ISnippetPreview {
  description: string;
  name: string;
  uid: string;
  author: {
    name: string;
    uid: string;
  };
  public: boolean;
}

export interface ISnippet extends ISnippetPreview {
  code: ICodeItem[];
}

export interface ISnippetActionForm {
  description: FormControl<string>;
  name: FormControl<string>;
  public: FormControl<boolean>;
  code: FormArray<FormControl<ICodeItem>>;
}

export interface ICodeItem {
  language: string;
  code: string;
}
