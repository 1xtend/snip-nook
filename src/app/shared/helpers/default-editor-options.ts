import { IEditorOptions } from '@shared/models/editor.interface';

export const defaultEditorOptions: IEditorOptions = {
  language: 'plaintext',
  minimap: {
    enabled: false,
  },
  contextmenu: false,
  scrollBeyondLastLine: false,
};
