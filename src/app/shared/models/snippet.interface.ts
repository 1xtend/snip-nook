export interface ISnippetPreview {
  description?: string;
  name: string;
  likes: number;
  saves: number;
  uid: string;
  author: {
    name: string;
    uid: string;
  };
}

export interface ISnippet extends ISnippetPreview {
  code: ICodeItem[];
}

export interface ICodeItem {
  language: string;
  code: string;
}
