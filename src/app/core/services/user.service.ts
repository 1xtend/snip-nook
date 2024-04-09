import { Injectable } from '@angular/core';
import { Firestore, collectionData, docData } from '@angular/fire/firestore';
import { TabType } from '@shared/models/tab.type';
import { IUser } from '@shared/models/user.interface';
import { collection, doc } from 'firebase/firestore';
import { Observable, shareReplay } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  constructor(private fs: Firestore) {}

  getUser(uid: string): Observable<IUser | undefined> {
    const userDoc = doc(this.fs, '/users', uid);
    return docData(userDoc) as Observable<IUser | undefined>;
  }

  getUserCollection(type: TabType, uid: string) {
    const userCollection = collection(this.fs, '/users', uid, type);
    return collectionData(userCollection);
  }
}
