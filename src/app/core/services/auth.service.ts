import { Injectable, inject } from '@angular/core';
import {
  Auth,
  GoogleAuthProvider,
  authState,
  createUserWithEmailAndPassword,
  signInWithCredential,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  User,
} from '@angular/fire/auth';
import { Observable } from 'rxjs';
import { GoogleSignIn } from '@capawesome/capacitor-google-sign-in';
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

const GOOGLE_WEB_CLIENT_ID =
  '42918699567-1niphchki4b4ulpj02f5p3gb4q4jur3j.apps.googleusercontent.com';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private auth = inject(Auth);
  private firestoreService = inject(FirestoreService);
  private googleInitialized = false;

  readonly user$: Observable<User | null> = authState(this.auth);

  private async ensureGoogleInitialized(): Promise<void> {
    if (this.googleInitialized) return;
    await GoogleSignIn.initialize({ clientId: GOOGLE_WEB_CLIENT_ID });
    this.googleInitialized = true;
  }

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

  async loginWithGoogle(): Promise<User> {
    await this.ensureGoogleInitialized();
    const result = await GoogleSignIn.signIn();
    const idToken = result.idToken;
    if (!idToken) throw new Error('Google no entregó idToken');
    const credential = GoogleAuthProvider.credential(idToken);
    const cred = await signInWithCredential(this.auth, credential);

    const profilePath = `users/${cred.user.uid}`;
    const existing = await this.firestoreService.getDocument<UserProfile>(profilePath);
    if (!existing) {
      const [firstName = '', ...rest] = (cred.user.displayName ?? '').split(' ');
      const profile: UserProfile = {
        uid: cred.user.uid,
        name: firstName,
        lastname: rest.join(' '),
        documentType: 'CC',
        documentNumber: '',
        country: '',
        email: cred.user.email ?? '',
        createdAt: Date.now(),
        biometricEnabled: false,
      };
      await this.firestoreService.setDocument(profilePath, profile);
    }
    return cred.user;
  }

  async logout(): Promise<void> {
    try {
      await GoogleSignIn.signOut();
    } catch {
      /* no-op if not signed in with Google */
    }
    await signOut(this.auth);
  }

  getProfile(uid: string): Promise<UserProfile | null> {
    return this.firestoreService.getDocument<UserProfile>(`users/${uid}`);
  }
}
