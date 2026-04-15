import { Injectable } from '@angular/core';
import { NativeBiometric, BiometryType } from 'capacitor-native-biometric';
import { Capacitor } from '@capacitor/core';

const SERVER = 'mydigitalwallet.credentials';

export interface StoredCredential {
  username: string;
  password: string;
}

@Injectable({ providedIn: 'root' })
export class BiometricService {
  get isNative(): boolean {
    return Capacitor.isNativePlatform();
  }

  async isAvailable(): Promise<boolean> {
    if (!this.isNative) return false;
    try {
      const res = await NativeBiometric.isAvailable();
      return res.isAvailable && res.biometryType !== BiometryType.NONE;
    } catch {
      return false;
    }
  }

  async verify(reason = 'Confirma tu identidad'): Promise<boolean> {
    if (!this.isNative) return true;
    try {
      await NativeBiometric.verifyIdentity({
        reason,
        title: 'MyDigitalWallet',
        subtitle: reason,
        description: 'Usa tu huella o reconocimiento facial',
      });
      return true;
    } catch {
      return false;
    }
  }

  async saveCredentials(cred: StoredCredential): Promise<void> {
    if (!this.isNative) return;
    await NativeBiometric.setCredentials({
      username: cred.username,
      password: cred.password,
      server: SERVER,
    });
  }

  async getCredentials(): Promise<StoredCredential | null> {
    if (!this.isNative) return null;
    try {
      const c = await NativeBiometric.getCredentials({ server: SERVER });
      return { username: c.username, password: c.password };
    } catch {
      return null;
    }
  }

  async deleteCredentials(): Promise<void> {
    if (!this.isNative) return;
    try {
      await NativeBiometric.deleteCredentials({ server: SERVER });
    } catch {
      /* no-op */
    }
  }
}
