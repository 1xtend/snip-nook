import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';

import { provideAuth, getAuth } from '@angular/fire/auth';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideFirebaseApp } from '@angular/fire/app';
import { provideFirestore, getFirestore } from '@angular/fire/firestore';
import { provideStorage, getStorage } from '@angular/fire/storage';
import { initializeApp } from 'firebase/app';

import { environment } from '@environments/environment';
import { MessageService } from 'primeng/api';
import { DialogService } from 'primeng/dynamicdialog';
import {
  NG_MONACO_EDITOR_CONFIG,
  NgMonacoEditorConfig,
} from '@1xtend/ng-monaco-editor';

const monacoConfig: NgMonacoEditorConfig = {
  defaultOptions: {
    theme: 'vs-dark',
    minimap: {
      enabled: false,
    },
    stickyScroll: {
      enabled: false,
    },
  },
  onMonacoLoad: () => {
    const monaco = (<any>window).monaco;

    monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
      noSemanticValidation: true,
      noSyntaxValidation: true,
    });
    monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
      noSemanticValidation: true,
      noSyntaxValidation: true,
    });
  },
};

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    importProvidersFrom(
      provideFirebaseApp(() => initializeApp(environment.firebase)),
    ),
    importProvidersFrom(provideAuth(() => getAuth())),
    importProvidersFrom(provideFirestore(() => getFirestore())),
    importProvidersFrom(provideStorage(() => getStorage())),
    MessageService,
    DialogService,
    provideAnimations(),
    {
      provide: NG_MONACO_EDITOR_CONFIG,
      useValue: monacoConfig,
    },
  ],
};
