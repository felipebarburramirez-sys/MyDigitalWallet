import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';

interface LoginResponse {
  token?: string;
  access_token?: string;
  jwt?: string;
}

export interface SendNotificationPayload {
  token: string;
  notification: { title: string; body: string };
  android?: { priority?: 'high' | 'normal'; data?: Record<string, string> };
}

@Injectable({ providedIn: 'root' })
export class HttpService {
  private http = inject(HttpClient);
  private jwt: string | null = null;

  private get baseUrl(): string {
    return environment.notificationsBackend.baseUrl;
  }

  private async login(): Promise<string> {
    const { email, password } = environment.notificationsBackend;
    const url = `${this.baseUrl}/user/login`;
    console.log('[Push] login ->', url);
    try {
      const res = await firstValueFrom(
        this.http.post<LoginResponse>(url, { email, password })
      );
      console.log('[Push] login response', res);
      const token = res.token ?? res.access_token ?? res.jwt;
      if (!token) throw new Error('Railway login: no token en respuesta');
      this.jwt = token;
      return token;
    } catch (e: any) {
      console.error('[Push] login error', e?.status, e?.statusText, e?.error, e?.message);
      throw e;
    }
  }

  private async ensureToken(): Promise<string> {
    return this.jwt ?? (await this.login());
  }

  async sendNotification(payload: SendNotificationPayload): Promise<void> {
    let jwt = await this.ensureToken();
    const url = `${this.baseUrl}/notifications/`;
    const send = (token: string) => {
      console.log('[Push] POST', url, 'payload=', JSON.stringify(payload));
      return firstValueFrom(
        this.http.post(url, payload, {
          headers: new HttpHeaders({ Authorization: `Bearer ${token}` }),
        })
      );
    };
    try {
      const r = await send(jwt);
      console.log('[Push] send OK', r);
    } catch (e: any) {
      console.error('[Push] send error #1', e?.status, e?.statusText, e?.error, e?.message);
      if (e?.status === 401 || e?.status === 403) {
        this.jwt = null;
        jwt = await this.login();
        try {
          const r2 = await send(jwt);
          console.log('[Push] send OK (retry)', r2);
        } catch (e2: any) {
          console.error('[Push] send error #2', e2?.status, e2?.statusText, e2?.error, e2?.message);
          throw e2;
        }
      } else {
        throw e;
      }
    }
  }
}
