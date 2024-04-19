import { Injectable, Query } from '@angular/core';
import { authState } from '@angular/fire/auth';
import {
  Firestore,
  collectionData,
  docData,
  collection,
  doc,
  deleteDoc,
  collectionSnapshots,
  orderBy,
  query,
  where,
  DocumentData,
  setDoc,
} from '@angular/fire/firestore';
import { ISnippet, ISnippetPreview } from '@shared/models/snippet.interface';
import { IUser } from '@shared/models/user.interface';
import { Observable, combineLatest, map, switchMap, take } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class FirestoreService {
  constructor(private fs: Firestore) {}

  // Users
  getUser(uid: string): Observable<IUser | undefined> {
    return docData(this.getDoc('users', uid)) as Observable<IUser | undefined>;
  }

  getUserSnippets(
    uid: string,
    owner: boolean = false,
  ): Observable<ISnippetPreview[]> {
    let snippets;

    if (owner) {
      snippets = this.getCollection('users', uid, 'snippets');
    } else {
      snippets = query(
        this.getCollection('users', uid, 'snippets'),
        where('public', '==', true),
      );
    }

    return collectionData(snippets) as Observable<ISnippetPreview[]>;
  }

  getSnippet(uid: string): Observable<ISnippet | undefined> {
    const snippetDoc = this.getDoc('snippets', uid);
    return docData(snippetDoc) as Observable<ISnippet | undefined>;
  }

  saveSnippet(uid: string, snippet: ISnippet) {
    const observables = [];

    return this.setDoc(snippet, 'users', snippet.author.uid, 'snippets', uid);
  }

  // Utils
  getDoc(path: string, ...pathSegments: string[]) {
    return doc(this.fs, path, ...pathSegments);
  }

  setDoc(data: unknown, path: string, ...pathSegments: string[]) {
    const doc = this.getDoc(path, ...pathSegments);
    return setDoc(doc, data);
  }

  getCollection(path: string, ...pathSegments: string[]) {
    return collection(this.fs, path, ...pathSegments);
  }

  deleteDoc(path: string, ...pathSegments: string[]) {
    return deleteDoc(this.getDoc(path, ...pathSegments));
  }

  checkUserSnippet(userUid: string, snippetUid: string) {
    return docData(this.getDoc('users', userUid, 'snippets', snippetUid));
  }

  deleteCollection(path: string, ...pathSegments: string[]) {
    const deleteCollection = collection(this.fs, path, ...pathSegments);

    return collectionSnapshots(deleteCollection).pipe(
      take(1),
      switchMap((res) => {
        const deletePromises: Promise<void>[] = [];

        res.forEach((doc) => {
          deletePromises.push(this.deleteDoc(path, ...pathSegments, doc.id));
        });

        return combineLatest(deletePromises);
      }),
    );
  }
}
