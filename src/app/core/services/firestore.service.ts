import { Injectable } from '@angular/core';
import {
  Firestore,
  collectionData,
  docData,
  collection,
  doc,
} from '@angular/fire/firestore';
import { ISnippetPreview } from '@shared/models/snippet.interface';
import { TabType } from '@shared/models/tab.type';
import { IUser } from '@shared/models/user.interface';
import { Observable, shareReplay } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class FirestoreService {
  constructor(private fs: Firestore) {}

  // Users
  userDoc(uid: string) {
    return doc(this.fs, 'users', uid);
  }

  getUser(uid: string): Observable<IUser | undefined> {
    const userDoc = doc(this.fs, '/users', uid);
    return docData(userDoc) as Observable<IUser | undefined>;
  }

  getUserSnippets(uid: string): Observable<ISnippetPreview[]> {
    const snippetsCollection = collection(this.fs, 'users', uid, 'snippets');
    return collectionData(snippetsCollection) as Observable<ISnippetPreview[]>;
  }

  // Usernames
  usernameDoc(username: string) {
    return doc(this.fs, 'usernames', username);
  }
}
