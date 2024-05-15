import { Injectable, inject } from '@angular/core';
import { Firestore, collection, doc, docData } from '@angular/fire/firestore';
import {
  Observable,
  switchMap,
  take,
  throwError,
  map,
  from,
  EMPTY,
} from 'rxjs';
import { AuthService } from './auth.service';
import { ISnippet, ISnippetPreview } from '@shared/models/snippet.interface';
import { writeBatch } from 'firebase/firestore';

@Injectable({
  providedIn: 'root',
})
export class SnippetService {
  private fs = inject(Firestore);
  private authService = inject(AuthService);

  user$ = this.authService.user$;

  getSnippet(uid: string): Observable<ISnippet | undefined> {
    const snippetDoc = doc(this.fs, 'snippets', uid);
    return docData(snippetDoc) as Observable<ISnippet | undefined>;
  }

  createSnippet(snippet: ISnippet): Observable<ISnippet> {
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
          public: snippet.public,
        };

        const snippetDoc = doc(this.fs, 'snippets', userSnippetDoc.id);
        const snippetData: ISnippet = {
          ...userSnippetData,
          uid: userSnippetDoc.id,
          code: snippet.code,
        };

        batch.set(userSnippetDoc, userSnippetData).set(snippetDoc, snippetData);

        return from(batch.commit()).pipe(map(() => snippetData));
      }),
    );
  }

  editSnippet(snippet: ISnippet): Observable<ISnippet> {
    return this.user$.pipe(
      take(1),
      switchMap((user) => {
        if (!user) {
          return throwError(() => new Error('User is not defined'));
        }

        const batch = writeBatch(this.fs);

        const userSnippetDoc = doc(
          this.fs,
          'users',
          user.uid,
          'snippets',
          snippet.uid,
        );
        const snippetDoc = doc(this.fs, 'snippets', snippet.uid);
        const userSnippetData: ISnippetPreview = {
          author: snippet.author,
          description: snippet.description,
          name: snippet.name,
          public: snippet.public,
          uid: snippet.uid,
        };

        batch.set(userSnippetDoc, userSnippetData).set(snippetDoc, snippet);

        return from(batch.commit()).pipe(map(() => snippet));
      }),
    );
  }

  deleteSnippet(uid: string): Observable<void> {
    return this.user$.pipe(
      take(1),
      switchMap((user) => {
        if (!user) {
          return throwError(() => new Error('User is not defined'));
        }

        const batch = writeBatch(this.fs);

        const userSnippetDoc = doc(this.fs, 'users', user.uid, 'snippets', uid);
        const snippetDoc = doc(this.fs, 'snippets', uid);

        batch.delete(userSnippetDoc).delete(snippetDoc);

        return batch.commit();
      }),
    );
  }
}
