import { Injectable, inject } from '@angular/core';
import {
  Auth,
  authState,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  User,
} from '@angular/fire/auth';
import { Observable } from 'rxjs';
import { FirestoreService } from './firestore.service';
import { UserProfile } from '../models/user.model';

export interface RegisterPayload {
  name: string;
  lastname: string;
  documentType: UserProfile['documentType'];
  documentNumber: string;
  country: string;
  email: string;
  password: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private auth = inject(Auth);
  private firestoreService = inject(FirestoreService);

  readonly user$: Observable<User | null> = authState(this.auth);

  get currentUser(): User | null {
    return this.auth.currentUser;
  }

  async login(email: string, password: string): Promise<User> {
    const cred = await signInWithEmailAndPassword(this.auth, email, password);
    return cred.user;
  }

  async register(payload: RegisterPayload): Promise<User> {
    const cred = await createUserWithEmailAndPassword(this.auth, payload.email, payload.password);
    const displayName = `${payload.name} ${payload.lastname}`.trim();
    await updateProfile(cred.user, { displayName });

    const profile: UserProfile = {
      uid: cred.user.uid,
      name: payload.name,
      lastname: payload.lastname,
      documentType: payload.documentType,
      documentNumber: payload.documentNumber,
      country: payload.country,
      email: payload.email,
      createdAt: Date.now(),
      biometricEnabled: false,
    };
    await this.firestoreService.setDocument(`users/${cred.user.uid}`, profile);
    return cred.user;
  }

  logout(): Promise<void> {
    return signOut(this.auth);
  }

  getProfile(uid: string): Promise<UserProfile | null> {
    return this.firestoreService.getDocument<UserProfile>(`users/${uid}`);
  }
}
