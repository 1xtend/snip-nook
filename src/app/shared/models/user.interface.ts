export interface ISocial {
  name: string;
  link: string;
  icon: string;
}

export interface IUserProfile {
  description?: string;
  socials?: ISocial[];
  birthday?: string | null;
}

export interface IUser extends IUserProfile {
  email: string;
  username: string;
  uid: string;
  photoURL: string | null;
  created_at: string;
}
