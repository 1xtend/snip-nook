import { Injectable } from '@angular/core';
import { Firestore, docData } from '@angular/fire/firestore';
import { IUser } from '@shared/models/user.interface';
import { doc } from 'firebase/firestore';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  constructor(private fs: Firestore) {}

  getUser(uid: string): Observable<IUser | undefined> {
    const userDoc = doc(this.fs, '/users', uid);

    return docData(userDoc) as Observable<IUser | undefined>;
  }
}
