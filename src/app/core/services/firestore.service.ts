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

  // Utils
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
