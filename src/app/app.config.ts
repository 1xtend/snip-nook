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
import {
  MonacoEditorModule,
  NgxMonacoEditorConfig,
} from 'ngx-monaco-editor-v2';
import { DialogService } from 'primeng/dynamicdialog';

const monacoConfig: NgxMonacoEditorConfig = {
  defaultOptions: {
    base: 'vs-dark',
    lineNumbers: true,
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
    importProvidersFrom(MonacoEditorModule.forRoot(monacoConfig)),
  ],
};
