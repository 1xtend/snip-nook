import { Injectable, Injector } from '@angular/core';
import { Firestore, collection, doc, docData } from '@angular/fire/firestore';
import { Observable, switchMap, take, throwError, map, from } from 'rxjs';
import { User } from 'firebase/auth';
import { AuthService } from './auth/auth.service';
import { ISnippet, ISnippetPreview } from '@shared/models/snippet.interface';
import { writeBatch } from 'firebase/firestore';
import { toObservable } from '@angular/core/rxjs-interop';

@Injectable({
  providedIn: 'root',
})
export class SnippetService {
  user$ = toObservable(this.authService.user);

  constructor(
    private fs: Firestore,
    private authService: AuthService,
  ) {}

  getSnippet(uid: string): Observable<ISnippet | undefined> {
    const snippetDoc = doc(this.fs, 'snippets', uid);
    return docData(snippetDoc) as Observable<ISnippet | undefined>;
  }

  addSnippet(snippet: ISnippet): Observable<ISnippet> {
    return this.user$.pipe(
      take(1),
      switchMap((user) => {
        if (!user || !user.displayName) {
          return throwError(() => new Error('User is not defined'));
        }

        const batch = writeBatch(this.fs);

        const snippetsCollection = collection(
          this.fs,
          'users',
          user.uid,
          'snippets',
        );

        const userSnippetDoc = doc(snippetsCollection);
        const userSnippetData: ISnippetPreview = {
          author: {
            name: user.displayName,
            uid: user.uid,
          },
          description: snippet.description,
          name: snippet.name,
          uid: userSnippetDoc.id,
        };

        const snippetDoc = doc(this.fs, 'snippets', userSnippetDoc.id);
        const snippetData: ISnippet = {
          author: {
            name: user.displayName,
            uid: user.uid,
          },
          description: snippet.description,
          name: snippet.name,
          uid: userSnippetDoc.id,
          code: snippet.code,
          public: snippet.public,
        };

        batch.set(userSnippetDoc, userSnippetData).set(snippetDoc, snippetData);

        return from(batch.commit()).pipe(map(() => snippetData));
      }),
    );
  }
}
