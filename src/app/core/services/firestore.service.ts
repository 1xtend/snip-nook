import { Injectable, inject } from '@angular/core';
import {
  Firestore,
  collectionData,
  docData,
  collection,
  doc,
  collectionSnapshots,
  query,
  where,
  writeBatch,
} from '@angular/fire/firestore';
import { ISnippetPreview } from '@shared/models/snippet.interface';
import { IUser } from '@shared/models/user.interface';
import { Observable, map, switchMap, take } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class FirestoreService {
  private fs = inject(Firestore);

  // Users
  getUser(uid: string): Observable<IUser | undefined> {
    return docData(doc(this.fs, 'users', uid)) as Observable<IUser | undefined>;
  }

  getUserSnippets(
    uid: string,
    owner: boolean = false,
  ): Observable<ISnippetPreview[]> {
    let snippets;

    if (owner) {
      snippets = collection(this.fs, 'users', uid, 'snippets');
    } else {
      snippets = query(
        collection(this.fs, 'users', uid, 'snippets'),
        where('public', '==', true),
      );
    }

    return collectionData(snippets) as Observable<ISnippetPreview[]>;
  }

  // Utils
  checkSnippetOwner(userUid: string, snippetUid: string): Observable<boolean> {
    return docData(doc(this.fs, 'users', userUid, 'snippets', snippetUid)).pipe(
      map((snippet) => !!snippet),
    );
  }

  deleteCollection(path: string, ...pathSegments: string[]) {
    const deleteCollection = collection(this.fs, path, ...pathSegments);

    return collectionSnapshots(deleteCollection).pipe(
      take(1),
      switchMap((res) => {
        const batch = writeBatch(this.fs);

        res.forEach((docSnapshot) => {
          const docRef = doc(this.fs, path, ...pathSegments, docSnapshot.id);
          batch.delete(docRef);
        });

        return batch.commit();
      }),
    );
  }
}
