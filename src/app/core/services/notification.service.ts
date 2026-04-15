import { Injectable, inject } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import {
  PushNotifications,
  Token,
  PushNotificationSchema,
  ActionPerformed,
} from '@capacitor/push-notifications';
import { AuthService } from './auth.service';
import { FirestoreService } from './firestore.service';
import { HttpService } from './http.service';
import { ToastService } from './toast.service';
import { DialogService } from './dialog.service';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private auth = inject(AuthService);
  private firestoreSvc = inject(FirestoreService);
  private httpSvc = inject(HttpService);
  private toast = inject(ToastService);
  private dialog = inject(DialogService);
  private fcmToken: string | null = null;
  private registered = false;

  get isNative(): boolean {
    return Capacitor.isNativePlatform();
  }

  async register(): Promise<void> {
    if (!this.isNative || this.registered) return;
    this.registered = true;

    const perm = await PushNotifications.checkPermissions();
    let status = perm.receive;
    if (status === 'prompt' || status === 'prompt-with-rationale') {
      status = (await PushNotifications.requestPermissions()).receive;
    }
    if (status !== 'granted') {
      console.warn('[Push] permiso no concedido');
      return;
    }

    PushNotifications.addListener('registration', async (token: Token) => {
      this.fcmToken = token.value;
      const user = this.auth.currentUser;
      if (user) {
        await this.firestoreSvc.updateDocument(`users/${user.uid}`, {
          fcmToken: token.value,
        });
      }
    });

    PushNotifications.addListener('registrationError', (err) => {
      console.error('[Push] registration error', err);
    });

    PushNotifications.addListener(
      'pushNotificationReceived',
      async (notification: PushNotificationSchema) => {
        const title = notification.title ?? 'Notificación';
        const body = notification.body ?? '';
        await this.toast.show(`${title}: ${body}`, 'success', 3500);
      }
    );

    PushNotifications.addListener(
      'pushNotificationActionPerformed',
      async (action: ActionPerformed) => {
        const n = action.notification;
        await this.dialog.alert(n.body ?? '', n.title ?? 'Notificación');
      }
    );

    await PushNotifications.register();
  }

  async sendPaymentSuccess(merchant: string, amount: number): Promise<void> {
    const user = this.auth.currentUser;
    if (!user) return;
    const profile = await this.firestoreSvc.getDocument<{ fcmToken?: string }>(
      `users/${user.uid}`
    );
    const token = profile?.fcmToken ?? this.fcmToken;
    if (!token) {
      console.warn('[Push] sin FCM token, no se envía notificación');
      return;
    }
    await this.httpSvc.sendNotification({
      token,
      notification: {
        title: 'Pago exitoso',
        body: `Has realizado un pago de $${amount.toLocaleString('es-CO')} a ${merchant}`,
      },
      android: { priority: 'high' },
    });
  }
}
