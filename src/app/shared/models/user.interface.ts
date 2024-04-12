import { FormControl } from '@angular/forms';

export interface IUser {
  email: string;
  username: string;
  uid: string;
  created_at: string;
  photoURL: string | null;
}
