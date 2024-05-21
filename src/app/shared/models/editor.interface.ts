import { ThemeType } from './theme.type';

export interface IEditorOptions {
  language: string;
  minimap: {
    enabled: boolean;
  };
  scrollBeyondLastLine: boolean;
  contextmenu?: boolean;
  readOnly?: boolean;
  theme?: 'vs-dark' | 'vs-light';
}
